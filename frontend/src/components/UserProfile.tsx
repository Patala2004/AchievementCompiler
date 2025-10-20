import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../api/userApi"; // your API function
import { SteamUser } from './SteamStructures'
import { PSNGame, PSNTrophy } from './PSNStructures';
import UserGameList from "./UserGameList";
import * as steamApi from "../api/steamApi"
import * as psnApi from "../api/psnApi"

export default function UserProfile() {
    const { id } = useParams();  // <-- This grabs the `id` from the URL
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [steamUser, setSteamUser] = useState<any>(null);
    const [steamUserError, setSteamUserError] = useState<boolean>(false);

    const [psnUser, setPsnUser] = useState<any>(null);
    const [psnUserError, setPsnUserError] = useState<boolean>(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                if (!id) return;
                const u = await getUserById(id);
                setUser(u);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [id]);

    useEffect(() => {
        async function fetchSteamUser() {
            try {
                const profile: SteamUser = await steamApi.getSteamProfile(user.steam_id);
                setSteamUser(profile);
            } catch (err: any) {
                setSteamUser(null);
                setSteamUserError(true);
            }
        }
        if (user?.steam_id) {
            fetchSteamUser();
        }
    }, [user]);

    // getPSNProfile
    useEffect(() => {
        async function fetchPSNUser() {
            try {
                const profile = await psnApi.getPSNProfile(user.psn_id);
                setPsnUser(profile);

            } catch (err: any) {
                setPsnUser(null);
                setPsnUserError(true);
            }
        }
        if (user?.psn_id) {
            fetchPSNUser();
        }
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    // Profile boxes
    let steamProfileBox = null;
    let psnProfileBox = null;

    
  // --- Steam Profile Box ---
  if (steamUser) {
    steamProfileBox = (
      <div className="bg-[#1F2A38] rounded-lg shadow-lg p-6 flex flex-col items-center text-white w-full sm:w-80">
        <img
          src={steamUser.avatarfull}
          alt={steamUser.personaname}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/fallback.jpg";
          }}
          className="w-24 h-24 rounded-full object-cover border-4 border-[#3C4758] shadow-md mb-3"
        />
        <h3 className="text-lg font-semibold mb-1">{steamUser.personaname}</h3>
        <p className="text-xs text-gray-400 mb-2">Steam ID: {steamUser.steamid}</p>
        <a
          href={`https://steamcommunity.com/profiles/${steamUser.steamid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 bg-gradient-to-r from-[#00B4DB] to-[#0083B0] rounded-md text-sm font-medium hover:from-[#00A2C2] hover:to-[#006E8C] transition-all duration-200"
        >
          View Steam Profile
        </a>
      </div>
    );
  } else if (steamUserError && user.steam_id) {
    steamProfileBox = (
      <div className="bg-[#1F2A38] rounded-lg shadow-lg p-6 flex flex-col items-center text-white w-full sm:w-80">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          alt="USER NOT FOUND"
          className="w-24 h-24 rounded-full object-cover border-4 border-[#3C4758] shadow-md mb-3"
        />
        <h3 className="text-lg font-semibold mb-1">Steam Profile Not Found</h3>
        <p className="text-xs text-gray-400 mb-2">Steam ID: {user.steam_id}</p>
      </div>
    );
  }

  // --- PSN Profile Box ---
  if (psnUser) {
    psnProfileBox = (
      <div className="bg-[#1F2A38] rounded-lg shadow-lg p-6 flex flex-col items-center text-white w-full sm:w-80">
        <img
          src={psnUser.avatar || "/fallback.jpg"}
          alt={psnUser.onlineId}
          className="w-24 h-24 rounded-full object-cover border-4 border-[#2C3848] shadow-md mb-3"
        />
        <h3 className="text-lg font-semibold mb-1">{psnUser.onlineId}</h3>
        <p className="text-xs text-gray-400 mb-2">User ID: {psnUser.userId}</p>
        <a
          href={`https://www.playstation.com/en-us/playstation-network/${psnUser.onlineId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 bg-gradient-to-r from-[#004AAD] to-[#0066CC] rounded-md text-sm font-medium hover:from-[#003C94] hover:to-[#0055B3] transition-all duration-200"
        >
          View PSN Profile
        </a>
      </div>
    );
  } else if (psnUserError && user.psn_id) {
    psnProfileBox = (
      <div className="bg-[#1F2A38] rounded-lg shadow-lg p-6 flex flex-col items-center text-white w-full sm:w-80">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          alt="USER NOT FOUND"
          className="w-24 h-24 rounded-full object-cover border-4 border-[#2C3848] shadow-md mb-3"
        />
        <h3 className="text-lg font-semibold mb-1">PSN Profile Not Found</h3>
        <p className="text-xs text-gray-400 mb-2">User ID: {user.psn_id}</p>
      </div>
    );
  }

  // --- Unified Profile Header ---
  const profileHeader = (
    <div className="text-center text-white mt-10">
      <h1 className="text-3xl font-bold">{user.username}</h1>
      <p className="text-gray-400 text-sm mt-1">Connected gaming accounts</p>
    </div>
  );

  const gradientSeparator = (<div className="mt-4 h-[2px] w-24 mx-auto bg-gradient-to-r from-[#00B4DB] to-[#0066CC] rounded-full"></div>);

  // --- Unified Profile Box ---
  const profileBox = (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col sm:flex-row justify-center items-stretch gap-6">
      {steamProfileBox}
      {psnProfileBox}
      {(!steamUser && !psnUser && !steamUserError && !psnUserError) && (
        <div className="bg-[#1F2A38] rounded-lg shadow-lg p-6 text-center text-white w-full sm:w-80">
          <p>Loading profiles...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-12">
      {profileHeader}
      {gradientSeparator}
      {profileBox}
      <br></br>
      {gradientSeparator}
      <UserGameList user={user} />
    </div>
  );
}