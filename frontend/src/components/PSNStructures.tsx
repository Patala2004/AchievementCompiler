import { useState } from "react";

export interface PSNUser{
  onlineId: string,
  avatar: string,
  userId: number
}

export interface PSNGame {
  id: string;
  name: string;
  image: string | null;
  totalPlaytimeHours: number | null;
  platform: string | null;
  definedTrophies: {
    bronze: number
    gold: number
    platinum: number
    silver: number
  } | null;
  earnedTrophies: {
    bronze: number
    gold: number
    platinum: number
    silver: number
  } | null;
}

export interface PSNTrophy {
  trophyName: string;
  isEarned: boolean;
  trophyDetail: string;
  type: string,
  earnedRate: number,
}


interface PSNAchievementListProps {
  trophies: PSNTrophy[];
}

const PSNAchievementList: React.FC<PSNAchievementListProps> = ({ trophies }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold mb-3 text-[#FFD700] flex items-center gap-1">
        Achievements:
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
        {trophies.map((trophy, index) => (
          <div
            key={trophy.trophyName}
            className={`rounded-lg border p-2 cursor-pointer transition-all duration-300 
                ${trophy.isEarned
                  ? "border-[#E4C76F]/40 bg-gradient-to-br from-[#3A3F4B] to-[#2C2F38] hover:shadow-[0_0_10px_rgba(255,215,0,0.3)] ring-[#FFD700]/60"
                  : "border-gray-600 bg-gradient-to-br from-[#2A2D34] to-[#1C1E23] hover:shadow-[0_0_8px_rgba(100,100,100,0.2)]"}
                hover:scale-105 ${expandedIndex === index ? "ring-2" : ""}`}
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${trophy.isEarned ? "text-[#FFD700]" : "text-gray-400"
                    }`}
                >
                  {trophy.isEarned ? "⭐" : "🔒"} {trophy.trophyName}
                </span>
                <span
                  className={`text-xs ${trophy.isEarned ? "text-[#FFD700]" : "text-gray-400"
                    }`}
                >
                  {expandedIndex === index ? "▲" : "▼"}
                </span>
              </div>
            {expandedIndex === index && (
                <div className="mt-2 text-xs transition-all duration-300">
                  <p className={`${trophy.isEarned ? "text-[#FFD700]" : "text-gray-400"}`}>
                    {trophy.trophyDetail || "No description available."}
                  </p>  
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PSNAchievementList;
