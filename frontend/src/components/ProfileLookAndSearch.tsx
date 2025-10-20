import { getAuthenticatedUser, getAllUsers } from "../api/userApi"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/axiosClient";


export default function UsersOverview() {
    const navigate = useNavigate();

    const [allUsers, setAllUsers] = useState<any[] | null>(null);
    const [hasAllUsers, setHasAllUsers] = useState(false);
    const [searchPattern, setSearchPattern] = useState(""); // <-- search state

    const fetchUsers = async (filter?: string) => {
        try {
            const users = await getAllUsers(filter);
            setAllUsers(users);
            setHasAllUsers(true);
        } catch (err) {
            setAllUsers(null);
            setHasAllUsers(false);
        }
    }

    // get all users
    useEffect(() => {
        fetchUsers();
    }, []);

    // handle search input changes
    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchPattern(value);
        fetchUsers(value); // call API with the search pattern
    }

    let profile_list = (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#1F2A38] rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-center text-white mb-6">
                User List
            </h2>

            {/* Search bar */}
            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchPattern}
                    onChange={handleSearch}
                    className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-600 bg-[#2C3848] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {allUsers && allUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {allUsers.map((user: any) => (
                        <div
                            key={user.id}
                            onClick={() => navigate(`/Profile/${user.id}`)}
                            className="bg-[#2C3848] rounded-lg shadow-md p-4 cursor-pointer
             hover:scale-105 hover:shadow-lg transition-transform duration-200 flex flex-col items-center text-center"
                        >
                            {/* Username */}
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {user.username}
                            </h3>

                            {/* Optional platform IDs */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {user.steam_id && (
                                    <span className="px-2 py-1 text-xs text-white rounded-full font-medium
                       bg-gradient-to-r from-[#00B4DB] to-[#0083B0] shadow-sm">
                                        Steam: {user.steam_id}
                                    </span>
                                )}
                                {user.psn_id && (
                                    <span className="px-2 py-1 text-xs text-white rounded-full font-medium
                       bg-gradient-to-r from-[#004AAD] to-[#0066CC] shadow-sm">
                                        PSN: {user.psn_id}
                                    </span>
                                )}
                                {user.xbox_id && (
                                    <span className="px-2 py-1 text-xs text-white rounded-full font-medium
                       bg-gradient-to-r from-[#107C10] to-[#2ECC40] shadow-sm">
                                        Xbox: {user.xbox_id}
                                    </span>
                                )}
                                {user.retroachievements_id && (
                                    <span className="px-2 py-1 text-xs text-white rounded-full font-medium
                       bg-gradient-to-r from-[#6A0DAD] to-[#C77DF3] shadow-sm">
                                        RA: {user.retroachievements_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400">No users found.</div>
            )}
        </div>
    );

    return (
        <div>
            {profile_list}
        </div>
    );
}