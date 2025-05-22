import React from 'react';
import SectionTitle from './ui/SectionTitle';
import TimelineItem from './ui/TimelineItem';
import { experience } from '../data/experience';

const Experience = () => {
  return (
    <section id="experience" className="py-24 px-6 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <SectionTitle 
          title="Work Experience" 
          subtitle="My Professional Journey" 
        />
        
        <div className="relative max-w-4xl mx-auto mt-16">
          {/* Timeline vertical line */}
          <div className="absolute left-0 md:left-1/2 h-full w-0.5 -translate-x-1/2 bg-blue-600 dark:bg-blue-500"></div>
          
          {/* Timeline items */}
          <div className="space-y-16">
            {experience.map((job, index) => (
              <TimelineItem 
                key={index}
                position={job.title}
                company={job.company}
                duration={job.duration}
                description={job.description}
                technologies={job.technologies}
                achievements={job.achievements}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;