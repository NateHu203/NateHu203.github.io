import React from 'react';

interface TimelineItemProps {
  position: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
  achievements: string[];
  isEven: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  position,
  company,
  duration,
  description,
  technologies,
  achievements,
  isEven
}) => {
  return (
    <div className={`relative flex flex-col md:flex-row md:items-center md:justify-between gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
      {/* Timeline dot */}
      <div className="absolute left-0 md:left-1/2 w-5 h-5 rounded-full bg-blue-600 -translate-x-1/2 border-4 border-white dark:border-gray-900"></div>
      
      {/* Date */}
      <div className={`md:w-5/12 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
        <div className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-full mb-2">
          {duration}
        </div>
      </div>
      
      {/* Content */}
      <div className={`md:w-5/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative ${isEven ? 'md:mr-10' : 'md:ml-10'}`}>
        {/* Triangle indicator */}
        <div className={`hidden md:block absolute top-1/2 -mt-2 w-0 h-0 border-t-8 border-b-8 border-transparent ${
          isEven 
            ? 'right-[-8px] border-l-8 border-l-white dark:border-l-gray-800' 
            : 'left-[-8px] border-r-8 border-r-white dark:border-r-gray-800'
        }`}></div>
        
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
          {position}
        </h3>
        <div className="text-blue-600 dark:text-blue-400 font-medium mb-3">
          {company}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
        
        {achievements.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Key Achievements:</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              {achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <span 
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;