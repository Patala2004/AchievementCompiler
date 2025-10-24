// UserGameList.tsx
import React, { useEffect, useState } from "react";
import { SteamGame, SteamAchievement } from "./SteamStructures";
import { PSNGame, PSNTrophy } from "./PSNStructures";
import { RetroAchievement, RetroGame } from "./RetroStructures";
import AchievementList from "./SteamStructures";
import PSNAchievementList from "./PSNStructures";
import RetroAchievementList from "./RetroStructures";
import * as steamApi from "../api/steamApi"
import * as psnApi from "../api/psnApi"
import * as retroApi from "../api/retroApi"


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
    const [retroGames, setRetroGames] = useState<RetroGame[] | null>(null);
    const [retroError, setRetroError] = useState<boolean>(false);

    const [steamAchievements, setSteamAchievements] = useState<SteamAchievement[][]>([]);
    const [loadingSteamAchievements, setLoadingSteamAchievements] = useState<boolean[]>([]);
    const [openSteamDropdowns, setOpenSteamDropdowns] = useState<boolean[]>([]);

    const [PSNTrophies, setPSNTrophies] = useState<PSNTrophy[][]>([]);
    const [loadingPSNTrophies, setLoadingPSNTrophies] = useState<boolean[]>([]);
    const [openPSNDorpdowns, setOpenPSNDorpdowns] = useState<boolean[]>([]);

    const [retroAchievements, setRetroAchievements] = useState<RetroAchievement[][]>([]);
    const [loadingRetroAchievements, setLoadingRetroAchievements] = useState<boolean[]>([]);
    const [openRetroDorpdowns, setOpenRetroDorpdowns] = useState<boolean[]>([]);

    const [selectedPlatform, setSelectedPlatform] = useState<string>('steam');

    const errorMessageProfileNotFound = "We couldn’t find the profile you’re looking for. Please make sure the profile exists and is set to public before trying again.";
    const errorMessageProfileNotSet = "This user doesn't have this profile set up yet."

    useEffect(() => {
        async function getSteamGames() {
            try {
                let gameList: SteamGame[] = await steamApi.getSteamOwnedGames(user.steam_id);
                gameList = gameList.filter(game => game.playtime_forever > 0);

                await setLoadingSteamAchievements(Array(gameList.length).fill(true)); // Set all achievement loading status as false
                await setOpenSteamDropdowns(Array(gameList.length).fill(false));
                await setSteamAchievements(Array(gameList.length).fill([]));

                setSteamGames(gameList);
            } catch (err: any) {
                await setSteamGames(null);
                await setSteamError(true)
            }
        }

        async function getPSNGames() {
            try {
                const gameList: PSNGame[] = await psnApi.getPSNUserGames(user.psn_id);

                await setLoadingPSNTrophies(Array(gameList.length).fill(true));
                await setOpenSteamDropdowns(Array(gameList.length).fill(false));
                await setPSNTrophies(Array(gameList.length).fill([]));

                setPSNGames(gameList);
            } catch (err: any) {
                await setPSNGames(null);
                await setPSNError(true);
            }

        }

        async function getRetroGames() {
            try {
                const gameList = await retroApi.getUserCompletionProgress(user.retroachievements_id);

                await setLoadingRetroAchievements(Array(gameList.length).fill(true));
                await setOpenRetroDorpdowns(Array(gameList.length).fill(false));
                await setRetroAchievements(Array(gameList.length).fill([]));

                setRetroGames(gameList);
            } catch (err: any) {
                await setRetroGames(null);
                await setRetroError(true);
            }
        }

        if (user?.steam_id) {
            getSteamGames();
        }
        if (user?.psn_id) {
            getPSNGames();
        }
        if (user?.retroachievements_id) {
            getRetroGames();
        }
    }, [user]);

    // useEffect(() => {
    //     async function getSteamAchievements() {
    //         let ach: SteamAchievement[][] = await steamApi.getSteamAchievements(user.steam_id, steamGames);
    //         setSteamAchievements(ach);
    //         // setLoadingSteamAchievements(false);
    //     }

    //     async function getPSNAchievements() {
    //         let ach: PSNTrophy[][] = await psnApi.getPSNGameTrophies(user.psn_id, psnGames);
    //         setPSNTrophies(ach);
    //         // setLoadingPSNTrophies(false);
    //     }

    //     async function getRetroAchievements() {
    //         let ach: RetroAchievement[][] = await retroApi.getAchievements(user.retroachievements_id, retroGames);
    //         setRetroAchievements(ach);
    //         // setLoadingRetroAchievements(false);
    //     }

    //     // if (steamGames) {
    //     //     getSteamAchievements();
    //     // }
    //     // if (psnGames) {
    //     //     getPSNAchievements();
    //     // }
    //     // if (retroGames) {
    //     //     getRetroAchievements();
    //     // }
    // }, [steamGames, psnGames, retroGames, user?.steam_id, user?.psn_id, user?.retroachievements_id]);


    const handleToggleDropdown = async (index: number, platform: string) => {
        if (!platforms.find((plat) => plat.id === platform)) {
            throw new Error("Tried to activate a dropdown for a platform that isn't supported wth");
        }

        if (platform === 'steam') {
            if (!steamGames) {
                return;
            }

            setOpenSteamDropdowns((prev) => {
                const newState = [...prev];
                newState[index] = !newState[index];
                return newState;
            });

            if (!openSteamDropdowns[index]) {
                // Fetch achievement if necessary
                if (steamAchievements[index] && steamAchievements[index].length === 0) {
                    const ach = await steamApi.getSteamAchievement(user.steam_id, steamGames[index]);
                    setSteamAchievements((prev) => {
                        const newState = [...prev];
                        newState[index] = ach;
                        return newState;
                    });
                    setLoadingSteamAchievements((prev) => {
                        const newState = [...prev];
                        newState[index] = false;
                        return newState;
                    });
                }
            }
        } else if (platform === 'psn') {
            if (!psnGames) {
                return;
            }

            setOpenPSNDorpdowns((prev) => {
                const newState = [...prev];
                newState[index] = !newState[index];
                return newState;
            });

            if (!openPSNDorpdowns[index]) {
                // Fetch achievement if necessary
                if (PSNTrophies[index] && PSNTrophies[index].length === 0) {
                    const ach = await psnApi.getPSNGameTrophy(user.psn_id, psnGames[index]);
                    setPSNTrophies((prev) => {
                        const newState = [...prev];
                        newState[index] = ach;
                        return newState;
                    });
                    setLoadingPSNTrophies((prev) => {
                        const newState = [...prev];
                        newState[index] = false;
                        return newState;
                    });
                }
            }
        } else if (platform === 'retro') {
            if (!retroGames) {
                return;
            }

            setOpenRetroDorpdowns((prev) => {
                const newState = [...prev];
                newState[index] = !newState[index];
                return newState;
            });

            if (!openRetroDorpdowns[index]) {
                // Fetch achievement if necessary
                if (retroAchievements[index] && retroAchievements[index].length === 0) {
                    const ach = await retroApi.getAchievementsOfGame(user.retroachievements_id, retroGames[index]);
                    setRetroAchievements((prev) => {
                        const newState = [...prev];
                        newState[index] = ach;
                        return newState;
                    });
                    setLoadingRetroAchievements((prev) => {
                        const newState = [...prev];
                        newState[index] = false;
                        return newState;
                    });
                }
            }
        } else {
            throw new Error("This line of code should be unreachable");
        }
    };



    if (!user) return null;

    // Platform selector
    const platforms = [
        { id: 'steam', label: 'Steam', color: 'from-[#00B4DB] to-[#0083B0]' },
        { id: 'psn', label: 'PSN', color: 'from-[#004AAD] to-[#0066CC]' },
        { id: 'retro', label: 'RA', color: 'from-[#6A0DAD] to-[#C77DF3]' },
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
                                    <button
                                        className="text-sm text-blue-400 hover:underline"
                                        onClick={() => handleToggleDropdown(index, 'steam')}
                                    >
                                        {openSteamDropdowns[index] ? "Hide Achievements" : "Show Achievements"}
                                    </button>

                                    {openSteamDropdowns[index] && (
                                        <div className="mt-2">
                                            {loadingSteamAchievements && loadingSteamAchievements[index] ? (
                                                <p className="text-xs text-gray-400">Loading...</p>
                                            ) : steamAchievements &&
                                                steamAchievements[index] &&
                                                steamAchievements[index].length > 0 &&
                                                steamAchievements[index][0].apiname !== "" ? (
                                                <>
                                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                        <div
                                                            className="bg-gradient-to-r from-[#FFD700] via-[#FFB800] to-[#FF8C00] h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${(steamAchievements[index].filter((ach) => ach.achieved === 1).length /
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
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (selectedPlatform === 'psn') {
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
                                                className="bg-gradient-to-r from-[#FFD700] via-[#FFB800] to-[#FF8C00] h-2 rounded-full transition-all duration-300"
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
                                            <span className="px-2 py-1 rounded bg-[#CD7F32] text-black font-semibold">
                                                🟠 {game.earnedTrophies.bronze}/{game.definedTrophies.bronze}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-[#C0C0C0] text-black font-semibold">
                                                ⚪ {game.earnedTrophies.silver}/{game.definedTrophies.silver}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-[#FFD700] text-black font-semibold">
                                                🟡 {game.earnedTrophies.gold}/{game.definedTrophies.gold}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-[#E5E4E2] text-black font-semibold">
                                                🟣 {game.earnedTrophies.platinum}/{game.definedTrophies.platinum}
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <button
                                                className="text-sm text-blue-400 hover:underline"
                                                onClick={() => handleToggleDropdown(index, 'psn')}
                                            >
                                                {openPSNDorpdowns[index] ? "Hide Trophies" : "Show Trophies"}
                                            </button>

                                            {openPSNDorpdowns[index] && (
                                                <div className="mt-2">
                                                    {loadingPSNTrophies && loadingPSNTrophies[index] ? (
                                                        <p className="text-xs text-gray-400">Loading...</p>
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
                                            )}
                                        </div>
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
    } else if (selectedPlatform === "retro") {
        if (!retroGames) {
            gameBox = (
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                    Loading your RetroAchievements library...
                </div>
            );

            if (retroError) {
                gameBox = (
                    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                        {errorMessageProfileNotFound}
                    </div>
                );
            } else if (!user.retroachievements_id || user.retroachievements_id === "") {
                gameBox = (
                    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                        {errorMessageProfileNotSet}
                    </div>
                );
            }
        } else if (retroGames.length === 0) {
            gameBox = (
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg text-center text-white">
                    No games found for this RetroAchievements account.
                </div>
            );
        } else
            gameBox = (
                <div className="max-w-6xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">
                        RetroAchievements Games ({retroGames.length})
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {retroGames.map((game, index) => (
                            <div
                                key={game.gameId}
                                className="bg-[#2C3848] rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-200 text-white"
                            >
                                {/* Game Icon */}
                                <img
                                    src={("https://retroachievements.org" + game.imageIcon) || "/fallback.jpg"}
                                    alt={game.title}
                                    className="w-full object-cover bg-[#00000033]"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/fallback.jpg";
                                    }}
                                />

                                {/* Game Info */}
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold mb-1">{game.title}</h3>
                                    <p className="text-sm text-gray-300 mb-2">{game.consoleName}</p>

                                    {/* Achievement Progress */}
                                    {game.maxPossible > 0 ? (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-gradient-to-r from-[#FFD700] via-[#FFB800] to-[#FF8C00] h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${(game.numAwarded / game.maxPossible) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {game.numAwarded}/{game.maxPossible} achievements unlocked
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 mt-1">
                                            No achievements defined.
                                        </p>
                                    )}

                                    {/** Achievement display */}

                                    <div className="mt-3">
                                        <button
                                            className="text-sm text-blue-400 hover:underline"
                                            onClick={() => handleToggleDropdown(index, 'retro')}
                                        >
                                            {openRetroDorpdowns[index] ? "Hide Achievements" : "Show Achievements"}
                                        </button>
                                    </div>

                                    {openRetroDorpdowns[index] && (
                                        <div className="mt-2">
                                            {loadingRetroAchievements && loadingRetroAchievements[index] ? (
                                                <p className="text-xs text-gray-400">Loading trophies...</p>
                                            ) : retroAchievements &&
                                                retroAchievements[index] &&
                                                retroAchievements[index].length > 0 ? (
                                                <RetroAchievementList achievements={retroAchievements[index]} />
                                            ) : (
                                                <p className="text-xs text-gray-400">
                                                    No trophies found for this game.
                                                </p>
                                            )}
                                        </div>
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
