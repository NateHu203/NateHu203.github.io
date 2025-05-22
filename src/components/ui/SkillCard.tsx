import React from 'react';

interface SkillCardProps {
  category: string;
  icon: React.ReactNode;
  items: string[];
}

const SkillCard: React.FC<SkillCardProps> = ({ category, icon, items }) => {
  return (
    <div className="p-6 rounded-lg hover:scale-105 transition-transform duration-300 bg-white shadow-md border border-gray-200 dark:bg-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-blue-500 dark:text-blue-400 animate-pulse">{icon}</div>
        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{category}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span 
            key={index}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300 rounded-full cyber-border border-blue-300 dark:border-blue-500/50"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillCard;