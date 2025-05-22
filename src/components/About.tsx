import React from 'react';
import SectionTitle from './ui/SectionTitle';

const techBadges = [
  { name: 'Python', imgSrc: 'https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white', linkUrl: 'https://www.python.org' },
  { name: 'R', imgSrc: 'https://img.shields.io/badge/R-276DC3?style=for-the-badge&logo=r&logoColor=white', linkUrl: 'https://www.r-project.org' },
  { name: 'Jupyter Notebook', imgSrc: 'https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white', linkUrl: 'https://jupyter.org' },
  { name: 'Pandas', imgSrc: 'https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white', linkUrl: 'https://pandas.pydata.org' },
  { name: 'NumPy', imgSrc: 'https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white', linkUrl: 'https://numpy.org' },
  { name: 'Scikit-learn', imgSrc: 'https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white', linkUrl: 'https://scikit-learn.org/stable/' },
  { name: 'Matplotlib', imgSrc: 'https://img.shields.io/badge/Matplotlib-11557c?style=for-the-badge&logo=matplotlib&logoColor=white', linkUrl: 'https://matplotlib.org' },
  { name: 'Seaborn', imgSrc: 'https://img.shields.io/badge/Seaborn-88d1de?style=for-the-badge&logo=seaborn&logoColor=white', linkUrl: 'https://seaborn.pydata.org' },
  { name: 'Plotly', imgSrc: 'https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white', linkUrl: 'https://plotly.com' },
  { name: 'Streamlit', imgSrc: 'https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white', linkUrl: 'https://streamlit.io' },
  { name: 'Large Language Model', imgSrc: 'https://img.shields.io/badge/LLM-blue?style=for-the-badge', linkUrl: '#' },
  { name: 'NLP', imgSrc: 'https://img.shields.io/badge/NLP-Natural%20Language%20Processing-yellow?style=for-the-badge', linkUrl: '#' },
  { name: 'Data Analysis', imgSrc: 'https://img.shields.io/badge/Data%20Analysis-2077B4?style=for-the-badge', linkUrl: '#' },
  { name: 'Machine Learning', imgSrc: 'https://img.shields.io/badge/Machine%20Learning-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white', linkUrl: 'https://www.tensorflow.org' },
];

const About = () => {
  return (
    <section id="about" className="py-24 px-6 bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Matrix-like background */}
      <div className="absolute inset-0 matrix-bg opacity-10 dark:opacity-20"></div>
      
      <div className="container mx-auto relative z-10">
        <SectionTitle title="About Me" subtitle="My Background & Skills" />
        
        <div className="flex flex-col gap-12 mb-16">

          {/* Row 1: My Journey and Education */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* My Journey Block */}
            <div className="p-8 rounded-lg bg-white shadow-lg border border-gray-200 dark:bg-gray-800 dark:text-gray-100 flex flex-col">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Journey</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
                <p>
                  As a dedicated and analytical Senior at Emory University, I am pursuing a challenging double major in <span className="cyber-text-gradient">Data Science</span> and <span className="cyber-text-gradient">Computer Science</span>. My core passion is to dissect complex challenges and build innovative, data-driven solutions.
                </p>
                <p>
                  My internship experiences at YSTen Technology and HireBeat Inc. have provided me with practical skills in metrics design, SQL optimization, in-depth data analysis, and impactful data visualization. I've contributed to significant projects enhancing user engagement and operational efficiency, utilizing tools like Python, SQL, Power BI, and BigQuery.
                </p>
                <p>
                  In research, I've worked with Tsinghua University's Future Intelligence Lab on <span className="cyber-text-gradient">Large Language Model</span> workflows and efficient reasoning. At Emory's Quantitative Theory & Method Department, I applied Python for textual analysis. My leadership role at the AI.Data Lab at Emory involved developing dashboards to analyze and improve donor retention, showcasing my ability to lead data initiatives.
                </p>
              </div>
            </div>

            {/* Education Block */}
            <div className="p-8 rounded-lg bg-white shadow-lg border border-gray-200 dark:bg-gray-800 dark:text-gray-100 flex flex-col">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Education</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
                <ul className="space-y-3">
                  <li>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold">Emory University, College of Art and Science</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Aug 2022 – Present</p>
                        <p className="mt-1 font-medium">Double Major: Data Science & Computer Science</p>
                        <div className="mt-1">
                          <p className="font-medium">Awards:</p>
                          <ul className="list-disc list-inside ml-4 text-sm">
                            <li>Dean's List 2022-2024</li>
                            <li>DataFest 2025 Best Insight Award</li>
                          </ul>
                        </div>
                        <p className="mt-1 font-medium">Key Coursework: 
                        </p>
                        <p className="text-sm">Probability & Statistics; Linear Algebra; Regression Analysis; Machine Learning; Discrete Mathematics; Data Structure and Algorithm; Machine Level Programming</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Row 2: Technical Skills Block */}
          <div>
            <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white text-center">Technical Skills</h3>
            <div className="flex flex-wrap justify-center items-center gap-4 p-4 rounded-lg bg-white shadow-lg border border-gray-200 dark:bg-gray-800">
              {techBadges.map((badge, index) => (
                <a href={badge.linkUrl} key={index} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                  <img src={badge.imgSrc} alt={badge.name} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;