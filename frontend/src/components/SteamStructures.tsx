import { useState } from 'react';

export interface SteamUser {
  personaname: string,
  avatarfull: string,
  steamid: number
}

export interface SteamGame {
  appid: number,
  name: string,
  playtime_forever: number
}

export interface SteamAchievement {
    apiname : string, // achievement name
    achieved : number, // 1 yes 0 no
    unlocktime : number,
    name : string,
    description : string
}

interface AchievementListProps {
  achievements: SteamAchievement[];
}

const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold mb-3">Achievements:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
        {achievements.map((ach, index) => (
          <div
            key={ach.apiname}
            className={`rounded-lg border p-2 cursor-pointer transition-all duration-300 
                ${ach.achieved
                  ? "border-[#E4C76F]/40 bg-gradient-to-br from-[#3A3F4B] to-[#2C2F38] hover:shadow-[0_0_10px_rgba(255,215,0,0.3)] ring-[#FFD700]/60"
                  : "border-gray-600 bg-gradient-to-br from-[#2A2D34] to-[#1C1E23] hover:shadow-[0_0_8px_rgba(100,100,100,0.2)]"}
                hover:scale-105 ${expandedIndex === index ? "ring-2" : ""}`}
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
              <span
                  className={`text-xs font-semibold flex items-center gap-1 ${ach.achieved ? "text-[#FFD700]" : "text-gray-400"
                    }`}
                >
                  {ach.achieved ? "⭐" : "🔒"} {ach.name}
                </span>
              <span
                  className={`text-xs ${ach.achieved ? "text-[#FFD700]" : "text-gray-400"
                    }`}
                >
                  {expandedIndex === index ? "▲" : "▼"}
                </span>
            </div>

            {/* Inline description */}
            {expandedIndex === index && (
                <div className="mt-2 text-xs transition-all duration-300">
                  <p className={`${ach.achieved ? "text-[#FFD700]" : "text-gray-400"}`}>
                    {ach.description || "No description available."}
                  </p>  
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementList;