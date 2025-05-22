import React, { useContext } from 'react';
import { Github as GitHub, Linkedin, FileText, ChevronDown, Instagram, Phone, Mail, GraduationCap } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';
import profileImage from '../../contents/5b2d31e6ca8ea21dc151af80a61493a3.jpg';
import resumePdf from '../../contents/Nate_Hu_Resume 8.pdf';

const Hero = () => {
  const { darkMode } = useContext(ThemeContext);
  
  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center relative px-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
    >
      {/* Matrix-like background - this might need adjustment if it's too prominent in light mode */}
      <div className="absolute inset-0 matrix-bg opacity-10 dark:opacity-20"></div>
      
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 relative z-10">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            <div className="typing-container">
              <span className="typing-effect">
                Hi, I'm <span className="cyber-text-gradient">Xinyuan Hu</span>
              </span>
            </div>
          </h1>
          <div className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl space-y-3">
            <p>
              I'm a Senior at Emory University, diving deep into <span className="cyber-text-gradient">Computer Science</span> and <span className="cyber-text-gradient">Data Science</span>. 
            </p>
            <p>
              When I'm not exploring data or building software, I enjoy playing the 🎹, hitting the 🏀 or 🎾, and strategizing in 🎮 like CSGO and LOL. 
            </p>
            <p>
              I'm actively seeking a Summer 2025 Internship as a <span className="cyber-text-gradient">Data Scientist/LLM Engineer</span> and would love to connect! Please feel free to reach out.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
            <a 
              href="#projects" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 cyber-border"
            >
              View Projects
            </a>
            <a 
              href="#contact" 
              className="px-6 py-3 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-all duration-300 hover:bg-blue-500/10 dark:hover:bg-blue-400/10 cyber-border"
            >
              Contact Me
            </a>
          </div>
          
          <div className="flex gap-6 mb-12">
            <a 
              href="https://github.com/NateHu203" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="GitHub profile"
            >
              <GitHub size={24} className="hover:animate-pulse" />
            </a>
            <a 
              href="https://www.linkedin.com/in/xinyuanhu03204/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="LinkedIn profile"
            >
              <Linkedin size={24} className="hover:animate-pulse" />
            </a>
            <a 
              href="https://www.instagram.com/nate_hxy/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="Instagram profile"
            >
              <Instagram size={24} className="hover:animate-pulse" />
            </a>
            <a 
              href="tel:+14342271447" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="Call phone"
            >
              <Phone size={24} className="hover:animate-pulse" />
            </a>
            <a 
              href="mailto:natehu2003@gmail.com" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="Send email"
            >
              <Mail size={24} className="hover:animate-pulse" />
            </a>
            <a 
              href="https://scholar.google.com/citations?user=v-W5zIYAAAAJ&hl=en" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="Google Scholar profile"
            >
              <GraduationCap size={24} className="hover:animate-pulse" />
            </a>
            <a 
              href={resumePdf} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="Download resume"
            >
              <FileText size={24} className="hover:animate-pulse" />
            </a>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center lg:justify-end">
          <div className="relative w-64 h-64 md:w-80 md:h-80 floating">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            <div className="relative w-full h-full cyber-border rounded-full overflow-hidden">
              <img 
                src={profileImage} 
                alt="Professional portrait" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={scrollToAbout}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default Hero;