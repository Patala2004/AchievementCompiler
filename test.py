import requests

api_key = "BFF4DEE266F9DFA352FD566DA7D16867"
steam_id = "76561199012409130"
appid = 1091500  # Cyberpunk 2077

url = f"https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/"
params = {
    "key": api_key,
    "steamid": steam_id,
    "appid": appid
}

response = requests.get(url, params=params)

print(response.status_code)  # Should be 200
print(response.text)         # See what was returned

# Only parse JSON if it looks correct
try:
    data = response.json()
    print(data)
except Exception as e:
    print("JSON decode failed:", e)


# url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
# params = {
#     "key": api_key,
#     "steamids": steam_id
# }

# response = requests.get(url, params=params)

# data = response.json()
# player = data["response"]["players"][0]
# username = player["personaname"]

# print(f"Username: {username}")