import React, { useState, useContext, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navItems = [
    { name: 'Home', id: 'hero' },
    { name: 'About', id: 'about' },
    { name: 'Projects', id: 'projects' },
    { name: 'Experience', id: 'experience' },
    { name: 'Publications', id: 'publications' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <>
      {/* Floating Island Navbar */}
      <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 
                    bg-white/70 dark:bg-gray-800/70 backdrop-blur-md 
                    shadow-xl dark:shadow-gray-900/50 rounded-full px-4`}
      >
        <nav className="container mx-auto">
          <div className="flex justify-center items-center h-14"> {/* Centered items, fixed height */}
            {/* Desktop Menu Items - always visible in island */}
            <div className="hidden md:flex space-x-6 items-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1"
                >
                  {item.name}
                </button>
              ))}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            
            {/* Mobile Menu Toggle - for smaller screens, shown within the island */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
               {/* Dark mode toggle also visible on mobile island if no menu open, or placed in menu */}
              {!isOpen && (
                <button
                  onClick={toggleDarkMode}
                  className="ml-2 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Mobile Dropdown Menu - appears below island */}
      {isOpen && (
        <div 
          className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-auto min-w-[200px] z-40
                     bg-white/90 dark:bg-gray-800/90 backdrop-blur-md 
                     shadow-xl rounded-xl animate-fadeIn overflow-hidden"
        >
          <div className="flex flex-col py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="py-2.5 px-6 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-left transition-colors"
              >
                {item.name}
              </button>
            ))}
            {/* Dark mode toggle inside mobile menu */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-4 pb-1">
              <button
                onClick={() => { toggleDarkMode(); setIsOpen(false);}}
                className="w-full flex justify-between items-center py-2 px-2 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                aria-label="Toggle dark mode"
              >
                <span>Switch Theme</span>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;