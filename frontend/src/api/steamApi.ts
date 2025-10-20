import { SteamGame, SteamAchievement, SteamUser } from "../components/SteamStructures"

export async function getSteamUsername(steamId: string) : Promise<string> {
    const response = await fetch(`http://localhost:5000/api/steam/getUsername?steamId=${steamId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();
    return data.response.players[0].personaname;
}

export async function getSteamProfile(steamId: string) : Promise<SteamUser> {
    const response = await fetch(`http://localhost:5000/api/steam/getUsername?steamId=${steamId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();
    return data.response.players[0];
}

export async function getSteamUserID(username: string) : Promise<string> {
    const response = await fetch(`http://localhost:5000/api/steam/getId?username=${username}`);

    if(!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();
    if(data.response.message === "No match"){
        throw new Error(`Failed to find user with username ${username}`);
    }
    return data.response.steamid;
}

export async function getSteamOwnedGames(steamId: string) : Promise<SteamGame[]> {
    const response = await fetch(`http://localhost:5000/api/steam/getOwnedGames?steamId=${steamId}`);

    if(!response.ok){
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();
    return data.response.games;
}

export async function getSteamAchievements(steamId: string, gameList: SteamGame[]|null) : Promise<SteamAchievement[][]> {
    if(gameList == null){
        return [];
    }
    let achievements: SteamAchievement[][] = [];
    for(let i: number = 0; i < gameList.length; i++){
        if(gameList[i].playtime_forever === 0){
            achievements.push([{apiname:"", unlocktime:0, achieved:0, name: "", description: ""}]);
            continue;
        }
        let appid = gameList[i].appid;
        const response = await fetch(`http://localhost:5000/api/steam/getAchievements?steamId=${steamId}&appid=${appid}`);

        if(!response.ok){
            throw new Error(`Failed to fetch (${response.status})`);
        }

        const data = await response.json();
        if(data.playerstats === "") achievements.push([{apiname:"", unlocktime:0, achieved:0, name: "", description: ""}]);
        else achievements.push(data.playerstats.achievements);
    }
    return achievements;
}

