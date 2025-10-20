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
              ${ach.achieved ? 'bg-gradient-to-r from-[#D4AF37] to-[#F9F295]' : 'bg-gray-700'}
              hover:scale-105`}
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${ach.achieved ? 'text-[#2D3542]':'text-white'} flex items-center gap-1`}>
                {ach.achieved ? '🏆' : '🔒'} {ach.name}
              </span>
              <span className={`${ach.achieved ? 'text-[#2D3542]':'text-white'} text-xs`}>
                {expandedIndex === index ? '▲' : '▼'}
              </span>
            </div>

            {/* Inline description */}
            {expandedIndex === index && (
              <p className={`mt-2 text-xs ${ach.achieved ? 'text-[#2D3542]':'text-white'} transition-all duration-300`}>
                {ach.description || 'No description available.'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementList;