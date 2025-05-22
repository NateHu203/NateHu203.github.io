import React from 'react';
import SectionTitle from './ui/SectionTitle';
import BlogCard from './ui/BlogCard';
import { blogPosts } from '../data/blogPosts';

const Blog = () => {
  return (
    <section id="publications" className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <SectionTitle 
          title="Publications"
          subtitle="Insights & Research"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {blogPosts.map((post, index) => (
            <BlogCard 
              key={index}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              category={post.category}
              image={post.image}
              url={post.url}
              // readTime={post.readTime}
            />
          ))}
        </div>
        
       
      </div>
    </section>
  );
};

export default Blog;