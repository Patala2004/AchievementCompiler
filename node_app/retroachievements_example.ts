import { buildAuthorization, getGame, getUserProfile  } from "@retroachievements/api";


const username = "Patala";
const webApiKey = "cL2xIgwBazuvtln7OU3uAvpAGJOke7P2";

const authorization = buildAuthorization({ username, webApiKey });

const game = await getGame(authorization, {gameId: 14402});

const userProfile = await getUserProfile(authorization, {username: "Patala"});

console.log(game);
console.log(userProfile);