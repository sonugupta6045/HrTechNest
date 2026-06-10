export type EducationEntry = {
  school: string;
  year: string;
  percentage: string;
};

export type ExperienceEntry = {
  company: string;
  position: string;
  duration: string;
  description: string;
};

export type ProjectEntry = {
  title: string;
  description: string;
  technologies: string;
  link?: string;
};

export type AchievementEntry = {
  title: string;
  description: string;
  year?: string;
};

export type ResumeData = {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  summary: string;
  education: {
    tenth: EducationEntry;
    twelfth: EducationEntry;
  };
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
  certifications: string[];
};

export type EducationField = "tenth" | "twelfth";
export type ExperienceField = "company" | "position" | "duration" | "description";
export type ProjectField = "title" | "description" | "technologies" | "link";
export type AchievementField = "title" | "description" | "year";
export type Section = "personalInfo" | "summary" | "education" | "skills" | "experience" | "projects" | "achievements" | "certifications";
export type PersonalInfoField = "name" | "email" | "phone" | "address";
