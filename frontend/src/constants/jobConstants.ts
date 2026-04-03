export const JOB_CATEGORIES = [
  "프론트엔드",
  "백엔드",
  "풀스택",
  "PM",
  "AI/LLM 엔지니어",
  "디자이너",
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

export const AVAILABLE_SKILLS = [
  // Programming Languages
  "JAVA",
  "Python",
  "JavaScript",
  "TypeScript",
  "C++",
  "C#",
  
  // Cloud & DevOps
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "GitHub Actions",
  
  // Frontend
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Svelte",
  "HTML",
  "CSS",
  "SASS",
  "Tailwind",
  
  // Backend
  "Node.js",
  "Spring",
  "Django",
  "Flask",
  "Express",
  
  // Database
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  
  // AI / LLM / Data (NEW)
  "PyTorch",
  "TensorFlow",
  "LangChain",
  "OpenAI API",
  "Hugging Face",
  "Vector DB",
  "RAG",
  "Fine-tuning",
  "LLMOps",
  "Weights & Biases",
  
  // Tools & Others
  "Git",
  "SVN",
  "Figma",
  "Sketch",
  "Adobe XD",
];
