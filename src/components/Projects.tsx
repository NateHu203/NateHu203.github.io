import React, { useState } from 'react';
import SectionTitle from './ui/SectionTitle';
import ProjectCard from './ui/ProjectCard';
import { projects } from '../data/projects';

type ProjectCategory = 'all' | 'data-science' | 'machine-learning' | 'software' | 'ai';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>('all');
  
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);
  
  const filters = [
    { value: 'all', label: 'All Projects' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'ai', label: 'AI' }
  ];

  return (
    <section id="projects" className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <SectionTitle 
          title="My Projects" 
          subtitle="Showcasing My Technical Portfolio" 
        />
        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value as ProjectCategory)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.value 
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;