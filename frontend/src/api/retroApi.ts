import RetroAchievementList, { RetroUser, RetroGame, RetroAchievement } from "../components/RetroStructures";

export async function getRetroProfile(retroUsername: string): Promise<RetroUser> {
    const response = await fetch(`http://localhost:5000/api/retro/getProfile?retroUsername=${retroUsername}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();
    return data;
}

export async function getUserCompletionProgress(retroUsername: string): Promise<RetroGame[]> {
    const response = await fetch(`http://localhost:5000/api/retro/getUserCompletionProgress?retroUsername=${retroUsername}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();
    return data.results;
}

export async function getAchievementsOfGame(retroUsername: string, game: RetroGame): Promise<RetroAchievement[]> {
    if (!game) return [];

    const response = await fetch(`http://localhost:5000/api/retro/getAchievementsEarnedForSpecificGame?retroUsername=${retroUsername}&gameId=${game.gameId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();

    const acharray = Object.values(data.achievements as Record<string, RetroAchievement>).sort(
        (a: RetroAchievement, b: RetroAchievement) => {
            return a.dateEarned ? -1 : 1;
        }
    ); // Sort so earned achievements go to the top

    return acharray;
}