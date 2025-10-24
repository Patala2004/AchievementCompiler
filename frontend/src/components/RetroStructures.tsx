import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS, useState } from 'react';

export interface RetroUser {
  user: string,
  totalPoints: number,
  userPic: string,
  motto: string
}

export interface RetroGame {
  gameId: number,
  title: string,
  imageIcon: string,
  numAwarded: number,
  maxPossible: number,
  consoleName: string
}

export interface RetroAchievement {
  title: string,
  description: string,
  id: number,
  dateEarned: string
}

interface RetroAchievementListProps {
  achievements: RetroAchievement[];
}

const RetroAchievementList: React.FC<RetroAchievementListProps> = ({ achievements }) => {
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
        {achievements.map((ach, index) => {
          const earned = !!ach.dateEarned;
          
          return (
            <div
              key={ach.id}
              onClick={() => toggleExpand(index)}
              className={`rounded-lg border p-2 cursor-pointer transition-all duration-300 
                ${earned
                  ? "border-[#E4C76F]/40 bg-gradient-to-br from-[#3A3F4B] to-[#2C2F38] hover:shadow-[0_0_10px_rgba(255,215,0,0.3)] ring-[#FFD700]/60"
                  : "border-gray-600 bg-gradient-to-br from-[#2A2D34] to-[#1C1E23] hover:shadow-[0_0_8px_rgba(100,100,100,0.2)]"}
                hover:scale-105 ${expandedIndex === index ? "ring-2" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${earned ? "text-[#FFD700]" : "text-gray-400"
                    }`}
                >
                  {earned ? "⭐" : "🔒"} {ach.title}
                </span>
                <span
                  className={`text-xs ${earned ? "text-[#FFD700]" : "text-gray-400"
                    }`}
                >
                  {expandedIndex === index ? "▲" : "▼"}
                </span>
              </div>

              {expandedIndex === index && (
                <div className="mt-2 text-xs transition-all duration-300">
                  <p className={`${earned ? "text-[#FFD700]" : "text-gray-400"}`}>
                    {ach.description || "No description available."}
                  </p>  
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RetroAchievementList;