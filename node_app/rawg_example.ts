import fetch from "node-fetch";

const API_KEY = "e9546043d22d4aae8ec55dc7efb2bb92";

// Function to fetch achievements for a specific game
async function getGameAchievements(gameId: number) {
  const url = `https://api.rawg.io/api/games/${gameId}/achievements?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { results: Array<{ id: number; name: string; percent?: number }> };
    return data.results; // Array of achievements
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }
}

// Function to search for a game by name
async function getGameIdByName(gameName: string) {
  const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(
    gameName
  )}&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { results: Array<{ id: number; name: string }> };
    if (data.results && data.results.length > 0) {
      // Return the first match
      const game = data.results[0];
      return { id: game.id, name: game.name };
    } else {
      console.log("No game found with that name.");
      return null;
    }
  } catch (error) {
    console.error("Error searching for game:", error);
    return null;
  }
}

function getAchievementsByName(gameName: string){
    getGameIdByName(gameName).then((game) => {
        if(game){
            const gameID = game.id;
            console.log(`Achievements for the game ${gameName}: `);
            getGameAchievements(gameID).then((achievements) =>{
                achievements.forEach((achievement: { name: any; percent?: any; }) => {
                    if (achievement.percent !== undefined) {
                        console.log(`- ${achievement.name} (${achievement.percent}% unlocked)`);
                    } else {
                        console.log(`- ${achievement.name}`);
                    }
                });
            });
        }
        else{
            console.log(`No game with the name ${gameName} found`);
        }
    });
}


// Example usage
getAchievementsByName("Cyberpunk 2077");

