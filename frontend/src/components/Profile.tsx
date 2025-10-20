import React, { useEffect, useState } from "react";
import { getAuthenticatedUser, updateAuthenticatedUser } from "../api/userApi";
import { useNavigate } from 'react-router-dom';
import { SteamGame, SteamAchievement } from './SteamStructures'
import { PSNGame, PSNTrophy } from './PSNStructures';
import UserGameList from "./UserGameList";
import * as steamApi from "../api/steamApi"
import * as psnApi from "../api/psnApi"


export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({
    username: "",
    steam_id: "",
    xbox_id: "",
    psn_id: "",
    retroachievements_id: "",
    id: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // get loggin info
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");
        const u = await getAuthenticatedUser();
        await setUser(u);
        setIsLoggedIn(true);
      } catch (err) {
        setUser(null);
        setIsLoggedIn(false);
        navigate('/Login');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [navigate]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateAuthenticatedUser(user); // API call to update user
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  let profile_info_square = (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-[#717E91] rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">{user.user}</h2>
      <div>Loading...</div>
    </div>
  );

  const gradientSeparator = (<div className="mt-4 h-[2px] w-24 mx-auto bg-gradient-to-r from-[#00B4DB] to-[#0066CC] rounded-full"></div>);

  if (!loading) profile_info_square = (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">{user.user}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="steam_id" className="text-gray-400 font-medium mb-1">Steam ID:</label>
          <input
            type="text"
            name="steam_id"
            id="steam_id"
            value={user.steam_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-600 bg-[#2C3848] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="xbox_id" className="text-gray-400 font-medium mb-1">Xbox ID:</label>
          <input
            type="text"
            name="xbox_id"
            id="xbox_id"
            value={user.xbox_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-600 bg-[#2C3848] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="psn_id" className="text-gray-400 font-medium mb-1">PSN ID:</label>
          <input
            type="text"
            name="psn_id"
            id="psn_id"
            value={user.psn_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-600 bg-[#2C3848] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="retroachievements_id" className="text-gray-400 font-medium mb-1">RetroAchievements ID:</label>
          <input
            type="text"
            name="retroachievements_id"
            id="retroachievements_id"
            value={user.retroachievements_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-600 bg-[#2C3848] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md font-semibold transition-all duration-200"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );

  return (
    <div>
      {profile_info_square}
      <br></br>
      {gradientSeparator}
      <UserGameList
        user={user}
      />
    </div>
  );
}