import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-xl text-blue-600 dark:text-blue-400">
        {subtitle}
      </p>
      <div className="w-24 h-1 bg-blue-500 dark:bg-blue-600 mx-auto mt-6 cyber-border"></div>
    </div>
  );
};

export default SectionTitle;