export interface CourseModule {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "Active" | "Draft";
  modules: CourseModule[];
}

export const courses: Course[] = [
  {
    id: "course-1",
    name: "Data Security & Privacy Essentials",
    category: "Compliance",
    status: "Active",
    description: "A comprehensive course on data security, privacy regulations, and best practices for protecting organizational data.",
    modules: [
      { id: "soc2", name: "SOC 2" },
      { id: "gdpr", name: "GDPR" },
      { id: "phishing", name: "Phishing" },
      { id: "dataclass", name: "Data Classification" },
      { id: "incident", name: "Incident Response" },
      { id: "final-1", name: "Final Assessment" },
    ],
  },
  {
    id: "course-2",
    name: "AI Reskilling — Engineering",
    category: "AI Reskilling",
    status: "Active",
    description: "Upskill your engineering team with hands-on AI and machine learning fundamentals, prompt engineering, and applied projects.",
    modules: [
      { id: "prompt-eng", name: "Prompt Engineering" },
      { id: "ml-fund", name: "ML Fundamentals" },
      { id: "llm-arch", name: "LLM Architecture" },
      { id: "ai-ethics", name: "AI Ethics" },
      { id: "ai-project", name: "Applied AI Project" },
    ],
  },
];

export function getCourse(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}
