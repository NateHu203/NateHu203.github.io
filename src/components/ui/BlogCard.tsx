import React from 'react';
import { Clock } from 'lucide-react';

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  url: string;
  readTime?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  excerpt,
  date,
  category,
  image,
  url,
  readTime
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <a href={url} className="block relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
      </a>
      
      <div className="p-6">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>{date}</span>
          {readTime && (
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{readTime}</span>
            </div>
          )}
        </div>
        
        <a href={url} className="block">
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </a>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        <a 
          href={url} 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          Read More
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default BlogCard;