import { PSNGame, PSNTrophy, PSNUser } from '../components/PSNStructures';

export async function getPSNProfile(psnId: string): Promise<PSNUser> {
    const response = await fetch(`http://localhost:5000/api/psn/getProfileFromAccountId?psnId=${psnId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    let data = await response.json();
    data.avatar = data.avatars.filter((image: { size: string, url: string }) => image.size === "l")[0]?.url;
    data.userId = psnId;

    return data;
}

export async function getPSNUserGames(psnId: string): Promise<PSNGame[]> {
    const response = await fetch(`http://localhost:5000/api/psn/getUserPlayedGames?psnId=${psnId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();

    const titles = data?.trophyTitles || data?.data?.trophyTitles || data?.data?.titles || data?.titles || [];

    const games: PSNGame[] = titles.map((game: any) => {
        return {
            id: game.npCommunicationId,
            name: game.trophyTitleName,
            image: game.trophyTitleIconUrl || game.iconUrl || null,
            platform: game.trophyTitlePlatform,
            definedTrophies: game.definedTrophies,
            earnedTrophies: game.earnedTrophies,
            totalPlaytimeHours: 0
        };
    });

    return games;
}

export async function getPSNGameTrophies(psnId: string, games: PSNGame[] | null): Promise<PSNTrophy[][]> {
    let res: PSNTrophy[][] = [];

    if (!games || games.length === 0) {
        return res;
    }

    // Define rarity order: highest first
    const rarityOrder: Record<string, number> = {
        platinum: 4,
        gold: 3,
        silver: 2,
        bronze: 1,
    };

    for (let i = 0; i < games.length; i++) {
        const game: PSNGame = games[i];

        const response = await fetch(`http://localhost:5000/api/psn/getUserTrophiesEarnedForTitle?psnId=${psnId}&gameId=${game.id}&platform=${game.platform}`);

        const data = await response.json(); // data = array of trophies

        data.sort((a: { type: string | number; isEarned: any; }, b: { type: string | number; isEarned: any; }) => {
            // Compare by type rarity first (descending)
            const rarityDiff = rarityOrder[b.type] - rarityOrder[a.type];
            if (rarityDiff !== 0) return rarityDiff;

            // If same type, earned trophies first
            if (a.isEarned === b.isEarned) return 0;
            return a.isEarned ? -1 : 1;
        });

        res.push(data);

        if (!response.ok) {
            throw new Error(`Failed to fetch (${response.status})`);
        }
    }

    return res;
}

export async function getPSNGameTrophy(psnId: string, game: PSNGame): Promise<PSNTrophy[]> {
    if (!game) {
        return [];
    }

    // Define rarity order: highest first
    const rarityOrder: Record<string, number> = {
        platinum: 4,
        gold: 3,
        silver: 2,
        bronze: 1,
    };

    const response = await fetch(`http://localhost:5000/api/psn/getUserTrophiesEarnedForTitle?psnId=${psnId}&gameId=${game.id}&platform=${game.platform}`);

    const data = await response.json(); // data = array of trophies

    data.sort((a: { type: string | number; isEarned: any; }, b: { type: string | number; isEarned: any; }) => {
        if(a.isEarned && !b.isEarned) return -1;
        else if(b.isEarned && !a.isEarned) return 1;
        // Compare by type rarity first (descending)
        const rarityDiff = rarityOrder[b.type] - rarityOrder[a.type];
        if (rarityDiff !== 0) return rarityDiff;

        // If same type, earned trophies first
        if (a.isEarned === b.isEarned) return 0;
        return a.isEarned ? -1 : 1;
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    return data;
}


