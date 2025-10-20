const axios = require('axios');

const apiKey = 'BFF4DEE266F9DFA352FD566DA7D16867';
const steamId = '76561199012409130'; // Replace with target Steam ID
const appId = 1091500; // Cyberpunk 2077

async function getUsername(steamId) {
    try {
        const url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/';
        const response = await axios.get(url, {
            params: {
                key: apiKey,
                steamids: steamId
            }
        });

        const players = response.data.response.players;
        if (players.length === 0) return null;

        return players[0].personaname;
    } catch (error) {
        console.error('Error fetching username:', error.message);
        return null;
    }
}

async function getAchievements(steamId, appId) {
    try {
        const url = 'https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/';
        const response = await axios.get(url, {
            params: {
                key: apiKey,
                steamid: steamId,
                appid: appId
            }
        });

        // Steam may return empty or error if profile is private
        if (!response.data.playerstats || !response.data.playerstats.achievements) {
            console.log('No achievements available (profile may be private).');
            return;
        }

        const achievements = response.data.playerstats.achievements;
        achievements.forEach(a => {
            console.log(`${a.apiname}: ${a.achieved ? 'Unlocked' : 'Locked'}`);
        });
    } catch (error) {
        console.error('Error fetching achievements:', error.message);
    }
}

async function main() {
    const username = await getUsername(steamId);
    if (username) {
        console.log(`Username: ${username}`);
        console.log('Achievements:');
        await getAchievements(steamId, appId);
    } else {
        console.log('User not found.');
    }
}

main();
