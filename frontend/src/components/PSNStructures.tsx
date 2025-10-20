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

const trophyColors: Record<string, string> = {
  bronze: "bg-yellow-500 text-black",
  silver: "bg-gray-300 text-black",
  gold: "bg-orange-400 text-black",
  platinum: "bg-purple-600 text-white",
};

const PSNAchievementList: React.FC<PSNAchievementListProps> = ({ trophies }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold mb-3">Trophies:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
        {trophies.map((trophy, index) => (
          <div
            key={trophy.trophyName}
            className={`rounded-lg p-2 cursor-pointer transition-all duration-300 
              ${trophy.isEarned ? "shadow-lg" : "bg-gray-700 hover:bg-gray-600"}
            `}
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-2 text-xs font-semibold`}>
                {trophy.isEarned ? "🏆" : "🔒"} 
                <span className={`${trophyColors[trophy.type.toLowerCase()] || "bg-gray-500 text-white"} px-2 py-0.5 rounded`}>
                  {trophy.type}
                </span>
                {trophy.trophyName}
              </span>
              <span className="text-xs">{expandedIndex === index ? "▲" : "▼"}</span>
            </div>
            {expandedIndex === index && (
              <p className="mt-1 text-xs text-gray-200 transition-all duration-300">
                {trophy.trophyDetail || "No description available."}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PSNAchievementList;
