import tbcapstone from '../../contents/tbcapstone.png';
import emailllm from '../../contents/emaillm.png';
export const projects = [
  {
    title: "Capstone Project: TechBridge HomeBridger",
    description: "TechBridge is an Atlanta-based tech nonprofit organization that provides enterprise-grade software for nonprofit organizations in the areas of hunger relief, homelessness, social justice, and workforce development at below-market cost. This capstone project analyzed internal service data from the HomeBridger platform to explore the value of data sharing in maximizing the collective impact and reach of nonprofit organizations. The goal was to provide actionable insights for optimizing service delivery and improving client outcomes. ",
    image: tbcapstone,
    // demoUrl: "https://example.com",
    githubUrl: "https://github.com/NateHu203/Capstone-Project-TechBridge",
    technologies: ["Python", "Machine Learning", "Data Analysis","Data Dashboard","Streamlit"],
    category: "data-science"
  },
  {
    title: "Anime Recommendation System",
    description: "This project implements a robust anime recommendation system using machine learning techniques to provide personalized anime recommendations. The system analyzes user ratings, anime features, genre preferences, and viewing behaviors to predict how users would rate anime they haven't watched yet.",
    image: "https://assets.aboutamazon.com/dims4/default/618814b/2147483647/strip/true/crop/1279x720+0+0/resize/1240x698!/quality/90/?url=https%3A%2F%2Famazon-blogs-brightspot.s3.amazonaws.com%2F4d%2F45%2Fd46f0da841cd85b66504278d4003%2Fcrunchyrollpv.jpg",
    // demoUrl: "https://example.com",
    githubUrl: "https://github.com/NateHu203/CS-470-Anime-Recommendation-System",
    technologies: ["Python", "Machine Learning", "Scikit-learn", "Flask","HTML/CSS"],
    category: "machine-learning"
  },
  {
    title: "EmaiLLM: Bulk Email Cleaner",
    description: "EmailLLM: Bulk Cleanser is a project developed as part of the CS 329 course. It utilizes AI and Natural Language Processing (NLP) techniques to create an intelligent email filtering system. This project aims to classify and filter emails based on user-defined keywords and content relevance. Unwanted or irrelevant emails (bulk emails) are automatically stored in a separate folder to help reduce clutter in the inbox. The project aims to improve email organization, save storage space, and reduce the time spent manually sorting unwanted emails.",
    image: emailllm,
    // demoUrl: "https://example.com",
    githubUrl: "https://github.com/NateHu203/EmaiLLM",
    technologies: ["Python", "HTML/CSS", "JavaScript", "LLM", "Prompt Engineering"],
    category: "ai"
  },
  {
    title: "Career Path Prediction",
    description: "This project explores the use of machine learning, specifically Transformer models, to predict an individual's next likely career move based on their past job sequence. By analyzing the full trajectory of a person's career, this model aims to offer more accurate and personalized career path predictions. The insights generated can be valuable for enhancing career planning tools, informing HR systems, and guiding personalized learning and development recommendations, ultimately helping individuals navigate their professional journeys more effectively.",
    image: "https://www.aimbusinessschool.edu.au/sites/default/files/AIM-Blogs-Choosing-Your-Career-Path.png",
    // demoUrl: "https://example.com",
    githubUrl: "https://github.com/NateHu203/Career-Path-Prediction-QTM347",
    technologies: ["Python", "Transformer","Hugging Face"],
    category: "machine-learning"
  },
  // {
  //   title: "E-commerce Recommendation Engine",
  //   description: "A recommendation system that suggests products to users based on their browsing and purchase history.",
  //   image: "https://images.pexels.com/photos/6956800/pexels-photo-6956800.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  //   demoUrl: "https://example.com",
  //   githubUrl: "https://github.com",
  //   technologies: ["Python", "TensorFlow", "Flask", "MySQL", "Redis"],
  //   category: "machine-learning"
  // },
  // {
  //   title: "Cloud DevOps Pipeline",
  //   description: "An automated CI/CD pipeline for deploying machine learning models to production with monitoring and scaling.",
  //   image: "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  //   demoUrl: "https://example.com",
  //   githubUrl: "https://github.com",
  //   technologies: ["Kubernetes", "Docker", "GitHub Actions", "Terraform", "Prometheus"],
  //   category: "software"
  // }
];