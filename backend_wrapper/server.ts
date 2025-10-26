import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import type { AuthTokensResponse, Trophy } from "psn-api";
import { buildAuthorization, getUserProfile, getUserCompletionProgress, getAchievementsEarnedBetween, getGameInfoAndUserProgress } from "@retroachievements/api";
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
  getTitleTrophies,
  getUserTitles,
  makeUniversalSearch,
  TrophyRarity
} from "psn-api";
import { getProfileFromAccountId, getUserPlayedGames, getUserTrophiesEarnedForTitle } from "psn-api";

dotenv.config();

const app = express();
app.use(cors()); // allow all origins by default
app.use(express.json());

const PORT = process.env.PORT || 5000;

let retroAuth = null;
if (process.env.RETRO_USERNAME && process.env.RETRO_KEY) {
  retroAuth = buildAuthorization({ username: process.env.RETRO_USERNAME, webApiKey: process.env.RETRO_KEY });
}

// RENDER SERVER

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// STEAM

app.get("/api/steam/getUsername", async (req, res) => {
  const { steamId } = req.query;
  const STEAM_KEY = process.env.STEAM_KEY;

  if (!steamId) {
    return res.status(400).json({ error: "Missing steamId" });
  }

  try {
    const response = await axios.get(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
      {
        params: { key: STEAM_KEY, steamids: steamId },
      }
    );
    if (response.data?.response?.players && response.data?.response?.players.length === 0) {
      res.status(404).json({ error: "User not found " });
    }
    else res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/steam/getId", async (req, res) => {
  const { username } = req.query;
  const STEAM_KEY = process.env.STEAM_KEY;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    const response = await axios.get(
      "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
      {
        params: {
          "key": STEAM_KEY,
          "vanityurl": username,
        }
      }
    );
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/steam/getOwnedGames", async (req, res) => {
  const { steamId } = req.query;
  const STEAM_KEY = process.env.STEAM_KEY;

  if (!steamId) {
    return res.status(400).json({ error: "Missing steamId" });
  }

  try {
    const response = await axios.get(
      "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
      {
        params: { key: STEAM_KEY, steamid: steamId, include_played_free_games: true, include_appinfo: true },
      }
    );
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/steam/getAchievements", async (req, res) => {
  const { steamId, appid } = req.query;
  const STEAM_KEY = process.env.STEAM_KEY;

  if (!steamId || !appid) {
    return res.status(400).json({ error: "Missing steamId" });
  }

  try {
    const response = await axios.get(
      "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/",
      {
        params: { key: STEAM_KEY, steamid: steamId, appid: appid, l: "en" }
      }
    );
    res.json(response.data);
  } catch (err: any) {
    if (err.response.data?.playerstats.error === "Requested app has no stats") {
      res.status(200).json({ playerstats: "" });
    }
    else res.status(500).json({ error: err.message, appid: appid, steamid: steamId, errorStack: String(err) });
  }
});

// PSN

const NPSSO = process.env.PSN_NPSSO;
let accessCode: string | null = null;
let authorization: AuthTokensResponse | null = null;
let expirationDate: string;

async function getPSNAccessToken() {
  console.log("GETTING ACCESS TOKENS");
  if (!NPSSO) throw Error("NO NPSSO TOKEN GIVEN");
  accessCode = await exchangeNpssoForAccessCode(NPSSO);
  authorization = await exchangeAccessCodeForAuthTokens(accessCode);

  const now = new Date();
  expirationDate = new Date(now.getTime() + authorization.expiresIn * 1000).toISOString();

  console.log(`AUTH CODES RETRIEVED. EXPIRES AT ${expirationDate}`);
}

async function checkAndRenewPSNTokens() {
  try {
    // Check if codes have been set
    if (!accessCode || !authorization || !expirationDate) {
      await getPSNAccessToken();
      return;
    }
    // Check if tokens have expired
    const now = new Date();
    const isAccessTokenExpired = new Date(expirationDate).getTime() < (now.getTime() + 60000); // If expires in less that 1 min

    if (isAccessTokenExpired) {
      if (authorization.refreshTokenExpiresIn <= 60000) { // If expires in less than 1 min or is expired
        await getPSNAccessToken();
        return;
      }
      const updatedAuthorization = await exchangeRefreshTokenForAuthTokens(
        authorization.refreshToken
      );
      authorization = updatedAuthorization;
      expirationDate = new Date(now.getTime() + authorization.expiresIn * 1000).toISOString();
      console.log(`AUTH CODES RENEWED. EXPIRES AT ${expirationDate}`);
    }
  } catch (err: any) {
    console.error("Error renewing PSN tokens:", err);
    await getPSNAccessToken();
  }
}

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: any[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  return mergedTrophies;
};

const normalizeTrophy = (trophy: Trophy) => {
  return {
    isEarned: trophy.earned ?? false,
    earnedOn: trophy.earned ? trophy.earnedDateTime : "unearned",
    type: trophy.trophyType,
    rarity: rarityMap[trophy.trophyRare ?? 0],
    earnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    trophyDetail: trophy.trophyDetail,
    groupId: trophy.trophyGroupId
  };
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common"
};

app.get('/api/psn/getProfileFromAccountId', async (req, res) => {
  const { psnId } = req.query;

  if (!psnId) {
    return res.status(400).json({ error: "Missing psnId" });
  }

  await checkAndRenewPSNTokens(); // renews PSN tokens if expired

  if (!authorization) {
    return res.status(500).json({ error: "Authorization token was somehow null. Please check if NSPSNOO whatever token expiration." })
  }

  try {
    const response = await getProfileFromAccountId(authorization, String(psnId));
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/psn/getUserPlayedGames', async (req, res) => {
  const { psnId } = req.query;

  if (!psnId) {
    return res.status(400).json({ error: "Missing psnId" });
  }

  await checkAndRenewPSNTokens(); // renews PSN tokens if expired

  if (!authorization) {
    return res.status(500).json({ error: "Authorization token was somehow null. Please check if NSPSNOO whatever token expiration." })
  }

  const headerOverrides = {
    "Accept-Language": "en-US"
  }

  const options = {
    limit: 100,                // Max number of results
    offset: 0,                 // For pagination
    headerOverrides: headerOverrides
  };

  try {
    const response = await getUserTitles(authorization, String(psnId), options);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/psn/getUserTrophiesEarnedForTitle', async (req, res) => {
  const { psnId, gameId, platform } = req.query;

  if (!psnId || !gameId || !platform) {
    return res.status(400).json({ error: "Missing psnId" });
  }

  await checkAndRenewPSNTokens(); // renews PSN tokens if expired

  if (!authorization) {
    return res.status(500).json({ error: "Authorization token was somehow null. Please check if NSPSNOO whatever token expiration." })
  }

  const headerOverrides = {
    "Accept-Language": "en-US"
  }

  const options = {
    npServiceName: "trophy" as const
  };

  try {

    // Get the list of total trophies.
    const { trophies: titleTrophies } = await getTitleTrophies(
      authorization,
      String(gameId),
      "all",
      {
        npServiceName:
          String(platform).includes("PS5") ? undefined : "trophy"
      }
    );

    // Get the list of earned trophies.
    const { trophies: earnedTrophies } = await getUserTrophiesEarnedForTitle(
      authorization,
      String(psnId),
      String(gameId),
      "all",
      {
        npServiceName:
          String(platform).includes("PS5") ? undefined : "trophy"
      }
    );

    // Merge the two trophy lists.
    const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);

    res.json(mergedTrophies);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// ---- Retroachievements ----
app.get('/api/retro/getProfile', async (req, res) => {
  const { retroUsername } = req.query;

  if (!retroUsername) {
    return res.status(400).json({ error: "Missing username" });
  }

  if (!retroAuth) {
    return res.status(500).json({ error: "Authorization token is null. Please check that the API key is correct." })
  }

  try {
    const response = await getUserProfile(retroAuth, { username: String(retroUsername) });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/retro/getUserCompletionProgress', async (req, res) => {
  const { retroUsername } = req.query;

  if (!retroUsername) {
    return res.status(400).json({ error: "Missing username" });
  }

  if (!retroAuth) {
    return res.status(500).json({ error: "Authorization token is null. Please check that the API key is correct." })
  }

  try {
    const response = await getUserCompletionProgress(retroAuth, { username: String(retroUsername), count: 500 });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/retro/getAchievementsEarned', async (req, res) => {
  const { retroUsername } = req.query;

  if (!retroUsername) {
    return res.status(400).json({ error: "Missing username" });
  }

  if (!retroAuth) {
    return res.status(500).json({ error: "Authorization token is null. Please check that the API key is correct." })
  }

  try {
    const response = await getAchievementsEarnedBetween(retroAuth,
      { username: String(retroUsername), fromDate: new Date("2000-01-01"), toDate: new Date(Date.now()), });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/retro/getAchievementsEarnedForSpecificGame', async (req, res) => {
  const { retroUsername, gameId } = req.query;

  if (!retroUsername) {
    return res.status(400).json({ error: "Missing username" });
  }
  if (!gameId) {
    return res.status(400).json({ error: "Missing gameId" });
  }

  if (!retroAuth) {
    return res.status(500).json({ error: "Authorization token is null. Please check that the API key is correct." })
  }

  try {
    const response = await getGameInfoAndUserProgress(
      retroAuth,
      {
        username: String(retroUsername),
        gameId: String(gameId),
      },
    );
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- XBOX Functions ---

app.get('/api/xbox/getProfile', async (req, res) => {
  const { xboxId } = req.query;

  const XBOX_KEY = process.env.XBOX_KEY

  if (!xboxId) {
    return res.status(400).json({ error: "Missing xbox id" });
  }

  try {
    const response = await axios.get(
      `https://xbl.io/api/v2/account/${xboxId}/`,
      {
        headers: {
          'X-Authorization': `${XBOX_KEY}`
        },
      }
    );
    res.json(response.data);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/xbox/getGames', async (req, res) => {
  const {xboxId} = req.query;

  const XBOX_KEY = process.env.XBOX_KEY

  if (!xboxId) {
    return res.status(400).json({ error: "Missing xbox id" });
  }

  try {
    const response = await axios.get(
      `https://xbl.io/api/v2/player/titleHistory/${xboxId}/`,
      {
        headers: {
          'X-Authorization': `${XBOX_KEY}`
        },
      }
    );
    res.json(response.data);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } 
});


