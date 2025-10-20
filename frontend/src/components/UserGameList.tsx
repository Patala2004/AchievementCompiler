// UserGameList.tsx
import React, { useEffect, useState } from "react";
import { SteamGame, SteamAchievement } from "./SteamStructures";
import { PSNGame, PSNTrophy } from "./PSNStructures";
import AchievementList from "./SteamStructures";
import PSNAchievementList from "./PSNStructures";
import * as steamApi from "../api/steamApi"
import * as psnApi from "../api/psnApi"


type UserGameListProps = {
    user: {
        username: "",
        steam_id: "",
        xbox_id: "",
        psn_id: "",
        retroachievements_id: "",
        id: ""
    }
};

// Platform selector 

export default function UserGameList({
    user
}: UserGameListProps) {

    const [steamGames, setSteamGames] = useState<SteamGame[] | null>(null);
    const [steamError, setSteamError] = useState<boolean>(false);
    const [psnGames, setPSNGames] = useState<PSNGame[] | null>(null);
    const [psnError, setPSNError] = useState<boolean>(false);
    const [steamAchievements, setSteamAchievements] = useState<SteamAchievement[][] | null>(null);
    const [loadingSteamAchievements, setLoadingSteamAchievements] = useState<boolean>(true);
    const [PSNTrophies, setPSNTrophies] = useState<PSNTrophy[][] | null>(null);
    const [loadingPSNTrophies, setLoadingPSNTrophies] = useState<boolean>(true);

    const [selectedPlatform, setSelectedPlatform] = useState<string>('steam');

    const errorMessageProfileNotFound = "We couldn’t find the profile you’re looking for. Please make sure the profile exists and is set to public before trying again.";
    const errorMessageProfileNotSet = "This user doesn't have this profile set up yet."

    useEffect(() => {
        async function getSteamGames() {
            try {
                const gameList: SteamGame[] = await steamApi.getSteamOwnedGames(user.steam_id);
                await setSteamGames(gameList.filter(game => game.playtime_forever > 0));
            } catch (err: any) {
                await setSteamGames(null);
                await setSteamError(true)
            }
        }

        async function getPSNGames() {
            try {
                const gameList: PSNGame[] = await psnApi.getPSNUserGames(user.psn_id);
                await setPSNGames(gameList);
            } catch (err: any) {
                await setPSNGames(null);
                await setPSNError(true);
            }

        }

        if (user?.steam_id) {
            getSteamGames();
        }
        if (user?.psn_id) {
            getPSNGames();
        }
    }, [user]);

    useEffect(() => {
        async function getSteamAchievements() {
            let ach: SteamAchievement[][] = await steamApi.getSteamAchievements(user.steam_id, steamGames);
            setSteamAchievements(ach);
            setLoadingSteamAchievements(false);
        }

        async function getPSNAchievements() {
            let ach: PSNTrophy[][] = await psnApi.getPSNGameTrophies(user.psn_id, psnGames);
            setPSNTrophies(ach);
            setLoadingPSNTrophies(false);
        }

        if (steamGames) {
            getSteamAchievements();
        }
        if (psnGames) {
            getPSNAchievements();
        }
    }, [steamGames, psnGames, user?.steam_id, user?.psn_id]);

    if (!user) return null;

    // Platform selector
    const platforms = [
        { id: 'steam', label: 'Steam', color: 'from-[#00B4DB] to-[#0083B0]' },
        { id: 'psn', label: 'PSN', color: 'from-[#004AAD] to-[#0066CC]' },
    ];

    const platform_selector = (
        <div className="flex justify-center mt-8 mb-8">
            <div className="flex overflow-x-auto space-x-3 p-2 bg-[#1F2A38] rounded-full shadow-lg scrollbar-hide">
                {platforms.map((platform) => {
                    const isActive = selectedPlatform === platform.id;
                    return (
                        <button
                            key={platform.id}
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={`relative px-5 py-2 rounded-full font-medium transition-all duration-300 
              ${isActive
                                    ? `bg-gradient-to-r ${platform.color} text-white shadow-md scale-105`
                                    : 'bg-[#2C3848] text-gray-300 hover:text-white hover:bg-[#37475A]'
                                }`}
                        >
                            {platform.label}

                            {/* Animated indicator glow */}
                            {isActive && (
                                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-30 blur-md"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    let gameBox = null;


    if (selectedPlatform === "steam") {
        if (!steamGames) {
            gameBox = (
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                    Loading your Steam library...
                </div>
            );
            if (steamError) {
                gameBox = (
                    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                        {errorMessageProfileNotFound}
                    </div>
                );
            }
            else if (!user.steam_id || user.steam_id === "") {
                gameBox = (
                    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                        {errorMessageProfileNotSet}
                    </div>
                );
            }

        }
        else if (steamGames.length === 0) {
            gameBox = (
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                    No games found for this Steam account.
                </div>
            );
        }

        else gameBox = (
            <div className="max-w-6xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-white mb-6">
                    Steam Games ({steamGames.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {steamGames.map((game, index) => (
                        <div
                            key={game.appid}
                            className="bg-[#2C3848] rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-200"
                        >
                            <img
                                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`}
                                alt={game.name}
                                className="w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/fallback.jpg";
                                }}
                            />
                            <div className="p-4 text-white">
                                <h3 className="text-lg font-semibold mb-1">{game.name}</h3>
                                <p className="text-sm text-gray-300">
                                    Playtime: {(game.playtime_forever / 60).toFixed(1)} hrs
                                </p>

                                <div className="mt-3">
                                    {loadingSteamAchievements ? (
                                        <p className="text-xs text-gray-400">Loading...</p>
                                    ) : steamAchievements &&
                                        steamAchievements[index] &&
                                        steamAchievements[index][0].apiname !== "" ? (
                                        <>
                                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${(steamAchievements[index].filter(
                                                            (ach) => ach.achieved === 1
                                                        ).length /
                                                            steamAchievements[index].length) *
                                                            100
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                            <AchievementList achievements={steamAchievements[index]} />
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-400">No achievements found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else {
        if (!psnGames) {
            gameBox = (
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                    Loading your PSN library...
                </div>
            );
            if (psnError) {
                gameBox = (
                    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                        {errorMessageProfileNotFound}
                    </div>
                );
            }
            else if (!user.psn_id || user.psn_id === "") {
                gameBox = (
                    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                        {errorMessageProfileNotSet}
                    </div>
                );
            }
        }

        else if (psnGames.length === 0) {
            gameBox = (
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                    No games found for this PSN account.
                </div>
            );
        }

        else gameBox = (
            <div className="max-w-6xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-white mb-6">
                    PSN Games ({psnGames.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {psnGames.map((game, index) => (
                        <div
                            key={game.id}
                            className="bg-[#2C3848] rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-200"
                        >
                            <img
                                src={game.image || "/fallback.jpg"}
                                alt={game.name}
                                className="w-full object-cover"
                            />
                            <div className="p-4 text-white">
                                <h3 className="text-lg font-semibold mb-1">{game.name}</h3>

                                {game.definedTrophies && game.earnedTrophies ? (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${((game.earnedTrophies.bronze +
                                                        game.earnedTrophies.silver +
                                                        game.earnedTrophies.gold +
                                                        game.earnedTrophies.platinum) /
                                                        (game.definedTrophies.bronze +
                                                            game.definedTrophies.silver +
                                                            game.definedTrophies.gold +
                                                            game.definedTrophies.platinum)) *
                                                        100
                                                        }%`,
                                                }}
                                            />
                                        </div>

                                        {/* Trophy badges */}
                                        <div className="flex flex-wrap gap-2 text-xs mb-2">
                                            <span className="px-2 py-1 rounded bg-yellow-500 text-black font-semibold">
                                                🟡 {game.earnedTrophies.bronze}/{game.definedTrophies.bronze}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-gray-300 text-black font-semibold">
                                                ⚪ {game.earnedTrophies.silver}/{game.definedTrophies.silver}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-orange-400 text-black font-semibold">
                                                🟠 {game.earnedTrophies.gold}/{game.definedTrophies.gold}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-purple-600 text-white font-semibold">
                                                🟣 {game.earnedTrophies.platinum}/{game.definedTrophies.platinum}
                                            </span>
                                        </div>

                                        {loadingPSNTrophies ? (
                                            <p className="text-xs text-gray-400">Loading trophies...</p>
                                        ) : PSNTrophies &&
                                            PSNTrophies[index] &&
                                            PSNTrophies[index].length > 0 ? (
                                            <PSNAchievementList trophies={PSNTrophies[index]} />
                                        ) : (
                                            <p className="text-xs text-gray-400">
                                                No trophies found for this game.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">
                                        No trophies defined for this game.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {platform_selector}
            {gameBox}
        </div>
    );
}
