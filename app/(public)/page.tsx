"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import JobListings from "@/components/job-listings"
import { Users, FileSearch, Calendar, BarChart4, ArrowRight, Download, File, Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export default function Home() {
  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })

  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 })

  const resumeRef = useRef(null)
  const resumePreviewRef = useRef(null)

  // Define types for resume data
  type EducationEntry = {
    school: string;
    year: string;
    percentage: string;
  };
  
  type ExperienceEntry = {
    company: string;
    position: string;
    duration: string;
    description: string;
  };
  
  type ProjectEntry = {
    title: string;
    description: string;
    technologies: string;
    link?: string;
  };
  
  type AchievementEntry = {
    title: string;
    description: string;
    year?: string;
  };
  
  type ResumeData = {
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

  // Resume form state
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    summary: "",
    education: {
      tenth: {
        school: "",
        year: "",
        percentage: "",
      },
      twelfth: {
        school: "",
        year: "",
        percentage: "",
      },
    },
    skills: [""],
    experience: [{
      company: "",
      position: "",
      duration: "",
      description: "",
    }],
    projects: [{
      title: "",
      description: "",
      technologies: "",
      link: "",
    }],
    achievements: [{
      title: "",
      description: "",
      year: "",
    }],
    certifications: [""],
  })

  // Type for education fields
  type EducationField = "tenth" | "twelfth";
  
  // Type for experience fields
  type ExperienceField = "company" | "position" | "duration" | "description";
  
  // Type for project fields
  type ProjectField = "title" | "description" | "technologies" | "link";
  
  // Type for achievement fields
  type AchievementField = "title" | "description" | "year";
  
  // Type for sections
  type Section = "personalInfo" | "summary" | "education" | "skills" | "experience" | "projects" | "achievements" | "certifications";
  
  // Type for personal info fields
  type PersonalInfoField = "name" | "email" | "phone" | "address";

  // Add these state variables inside your component function
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Handle form input changes
  const handleInputChange = (
    section: Section, 
    field: PersonalInfoField | ExperienceField | EducationField | ProjectField | AchievementField | null, 
    value: string | EducationEntry, 
    index: number | null = null
  ) => {
    setResumeData(prev => {
      const newData = { ...prev };
      
      if (section === "personalInfo" && field) {
        newData.personalInfo[field as PersonalInfoField] = value as string;
      } else if (section === "summary") {
        newData.summary = value as string;
      } else if (section === "education" && field) {
        newData.education[field as EducationField] = value as EducationEntry;
      } else if (section === "skills" && typeof index === 'number') {
        const newSkills = [...newData.skills];
        newSkills[index] = value as string;
        newData.skills = newSkills;
      } else if (section === "experience" && typeof index === 'number' && field) {
        const newExperience = [...newData.experience];
        newExperience[index][field as ExperienceField] = value as string;
        newData.experience = newExperience;
      } else if (section === "projects" && typeof index === 'number' && field) {
        const newProjects = [...newData.projects];
        newProjects[index][field as ProjectField] = value as string;
        newData.projects = newProjects;
      } else if (section === "achievements" && typeof index === 'number' && field) {
        const newAchievements = [...newData.achievements];
        newAchievements[index][field as AchievementField] = value as string;
        newData.achievements = newAchievements;
      } else if (section === "certifications" && typeof index === 'number') {
        const newCertifications = [...newData.certifications];
        newCertifications[index] = value as string;
        newData.certifications = newCertifications;
      }
      
      return newData;
    });
  };

  // Add new items to arrays
  const addItem = (section: "skills" | "experience" | "projects" | "achievements" | "certifications") => {
    setResumeData(prev => {
      const newData = { ...prev };
      
      if (section === "skills") {
        newData.skills = [...newData.skills, ""];
      } else if (section === "experience") {
        newData.experience = [...newData.experience, { 
          company: "", 
          position: "", 
          duration: "", 
          description: "" 
        }];
      } else if (section === "projects") {
        newData.projects = [...newData.projects, {
          title: "",
          description: "",
          technologies: "",
          link: "",
        }];
      } else if (section === "achievements") {
        newData.achievements = [...newData.achievements, {
          title: "",
          description: "",
          year: "",
        }];
      } else if (section === "certifications") {
        newData.certifications = [...newData.certifications, ""];
      }
      
      return newData;
    });
  };

  // Remove items from arrays
  const removeItem = (section: "skills" | "experience" | "projects" | "achievements" | "certifications", index: number) => {
    setResumeData(prev => {
      const newData = { ...prev };
      
      if (section === "skills" && newData.skills.length > 1) {
        newData.skills = newData.skills.filter((_, i) => i !== index);
      } else if (section === "experience" && newData.experience.length > 1) {
        newData.experience = newData.experience.filter((_, i) => i !== index);
      } else if (section === "projects" && newData.projects.length > 1) {
        newData.projects = newData.projects.filter((_, i) => i !== index);
      } else if (section === "achievements" && newData.achievements.length > 1) {
        newData.achievements = newData.achievements.filter((_, i) => i !== index);
      } else if (section === "certifications" && newData.certifications.length > 1) {
        newData.certifications = newData.certifications.filter((_, i) => i !== index);
      }
      
      return newData;
    });
  };

  // Generate and download PDF
  const generatePDF = async () => {
    if (!resumePreviewRef.current) return;
    
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set default font and size
    pdf.setFont('helvetica');
    
    // A4 dimensions in mm
    const a4Width = 210;
    const a4Height = 297;
    
    // Calculate margins
    const margin = 20;
    const contentWidth = a4Width - (margin * 2);
    
    // Starting y position for content
    let yPos = margin;
    
    // Set title (name)
    const name = resumeData.personalInfo.name || "Your Name";
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(name, margin, yPos);
    yPos += 10;
    
    // Contact info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    let contactText = '';
    
    if (resumeData.personalInfo.email) {
      contactText += resumeData.personalInfo.email;
    }
    
    if (resumeData.personalInfo.phone) {
      contactText += contactText ? ' • ' + resumeData.personalInfo.phone : resumeData.personalInfo.phone;
    }
    
    if (resumeData.personalInfo.address) {
      contactText += contactText ? ' • ' + resumeData.personalInfo.address : resumeData.personalInfo.address;
    }
    
    pdf.text(contactText, margin, yPos);
    yPos += 8;
    
    // Add divider line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPos, a4Width - margin, yPos);
    yPos += 5;
    
    // Profile Summary
    if (resumeData.summary) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Profile Summary", margin, yPos);
      yPos += 5;
      
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, contentWidth + margin, yPos);
      yPos += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Handle text wrapping for summary
      const splitSummary = pdf.splitTextToSize(resumeData.summary, contentWidth);
      pdf.text(splitSummary, margin, yPos);
      yPos += splitSummary.length * 5 + 5; // Add extra spacing after summary
    }
    
    // Education
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Education", margin, yPos);
    yPos += 5;
    
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPos, contentWidth + margin, yPos);
    yPos += 5;
    
    // 12th education
    if (resumeData.education.twelfth.school) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(resumeData.education.twelfth.school, margin, yPos);
      
      if (resumeData.education.twelfth.year) {
        const yearWidth = pdf.getTextWidth(resumeData.education.twelfth.year);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(resumeData.education.twelfth.year, a4Width - margin - yearWidth, yPos);
      }
      
      yPos += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let twelfthDetails = "12th Standard";
      
      if (resumeData.education.twelfth.percentage) {
        twelfthDetails += ` • ${resumeData.education.twelfth.percentage}`;
      }
      
      pdf.text(twelfthDetails, margin, yPos);
      yPos += 8;
    }
    
    // 10th education
    if (resumeData.education.tenth.school) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(resumeData.education.tenth.school, margin, yPos);
      
      if (resumeData.education.tenth.year) {
        const yearWidth = pdf.getTextWidth(resumeData.education.tenth.year);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(resumeData.education.tenth.year, a4Width - margin - yearWidth, yPos);
      }
      
      yPos += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let tenthDetails = "10th Standard";
      
      if (resumeData.education.tenth.percentage) {
        tenthDetails += ` • ${resumeData.education.tenth.percentage}`;
      }
      
      pdf.text(tenthDetails, margin, yPos);
      yPos += 10;
    }
    
    // Skills
    if (resumeData.skills.some(skill => skill)) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Skills", margin, yPos);
      yPos += 5;
      
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, contentWidth + margin, yPos);
      yPos += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const skills = resumeData.skills.filter(skill => skill).join(", ");
      const splitSkills = pdf.splitTextToSize(skills, contentWidth);
      pdf.text(splitSkills, margin, yPos);
      
      yPos += splitSkills.length * 5 + 5;
    }
    
    // Work Experience
    if (resumeData.experience.some(exp => exp.company || exp.position)) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Work Experience", margin, yPos);
      yPos += 5;
      
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, contentWidth + margin, yPos);
      yPos += 5;
      
      resumeData.experience.filter(exp => exp.company || exp.position).forEach((exp) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(exp.position || "Position", margin, yPos);
        
        if (exp.duration) {
          const durationWidth = pdf.getTextWidth(exp.duration);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(exp.duration, a4Width - margin - durationWidth, yPos);
        }
        
        yPos += 5;
        
        if (exp.company) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(exp.company, margin, yPos);
          yPos += 5;
        }
        
        if (exp.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const splitDesc = pdf.splitTextToSize(exp.description, contentWidth);
          pdf.text(splitDesc, margin, yPos);
          yPos += splitDesc.length * 5;
        }
        
        yPos += 5; // Space between experiences
      });
    }
    
    // Projects
    if (resumeData.projects.some(project => project.title || project.description)) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Projects", margin, yPos);
      yPos += 5;
      
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, contentWidth + margin, yPos);
      yPos += 5;
      
      resumeData.projects.filter(project => project.title || project.description).forEach((project) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(project.title || "Project", margin, yPos);
        yPos += 5;
        
        if (project.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const splitDesc = pdf.splitTextToSize(project.description, contentWidth);
          pdf.text(splitDesc, margin, yPos);
          yPos += splitDesc.length * 5;
        }
        
        if (project.technologies) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          const techText = "Technologies: " + project.technologies;
          const splitTech = pdf.splitTextToSize(techText, contentWidth);
          pdf.text(splitTech, margin, yPos);
          yPos += splitTech.length * 4;
        }
        
        yPos += 5; // Space between projects
      });
    }
    
    // Check if we need a new page for achievements and certifications
    if (yPos > (a4Height - 60)) {
      pdf.addPage();
      yPos = margin;
    }
    
    // Achievements
    if (resumeData.achievements.some(achievement => achievement.title || achievement.description)) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Achievements", margin, yPos);
      yPos += 5;
      
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, contentWidth + margin, yPos);
      yPos += 5;
      
      resumeData.achievements.filter(achievement => achievement.title || achievement.description).forEach((achievement) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(achievement.title || "Achievement", margin, yPos);
        
        if (achievement.year) {
          const yearWidth = pdf.getTextWidth(achievement.year);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(achievement.year, a4Width - margin - yearWidth, yPos);
        }
        
        yPos += 5;
        
        if (achievement.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const splitDesc = pdf.splitTextToSize(achievement.description, contentWidth);
          pdf.text(splitDesc, margin, yPos);
          yPos += splitDesc.length * 5;
        }
        
        yPos += 5; // Space between achievements
      });
    }
    
    // Certifications
    if (resumeData.certifications.some(cert => cert)) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Certifications", margin, yPos);
      yPos += 5;
      
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, contentWidth + margin, yPos);
      yPos += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      resumeData.certifications.filter(cert => cert).forEach((cert, index) => {
        pdf.text(`• ${cert}`, margin, yPos);
        yPos += 5;
      });
    }
    
    // Generate filename from candidate's name
    const candidateName = resumeData.personalInfo.name.trim();
    const sanitizedName = candidateName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const filename = sanitizedName 
      ? `${sanitizedName}-resume.pdf`
      : 'resume.pdf';
    
    pdf.save(filename);
  };

  const features = [
    {
      icon: FileSearch,
      title: "AI Resume Parsing",
      description: "Our AI automatically extracts key information from resumes, saving hours of manual data entry.",
    },
    {
      icon: Users,
      title: "Candidate Matching",
      description: "Match candidates to job descriptions based on skills, experience, and other relevant factors.",
    },
    {
      icon: Calendar,
      title: "Interview Scheduling",
      description: "Streamline the interview process with automated scheduling that integrates with Google Calendar.",
    },
    {
      icon: BarChart4,
      title: "Analytics Dashboard",
      description: "Get insights into your recruitment process with comprehensive analytics and reporting.",
    },
  ]

  const stats = [
    { value: "85%", label: "Time Saved in Resume Screening" },
    { value: "3x", label: "Faster Hiring Process" },
    { value: "95%", label: "Client Satisfaction" },
    { value: "60%", label: "Reduction in Hiring Costs" },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary to-primary-foreground/5 dark:from-primary/80 dark:to-background">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] [mask-image:radial-gradient(white,transparent_85%)]"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-300">
                AI-Powered HR Management System
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Streamline your recruitment process with our intelligent HR platform. From resume parsing to interview
                scheduling, we've got you covered.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/jobs">
                <Button size="lg" className="rounded-full">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-foreground/5"></div>
              <img
                src="/project01.png"
                alt="HR Dashboard Preview"
                className="w-full h-auto relative z-10 opacity-90 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                <p className="text-white text-lg font-medium">Powerful dashboard for HR professionals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our HR Management System is packed with features to help you streamline your recruitment process.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground" ref={statsRef}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Featured Job Openings</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our current job opportunities and find your next career move.
              </p>
            </motion.div>
          </div>

          <JobListings featured={true} />

          <div className="text-center mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/jobs">
                <Button variant="outline" size="lg" className="rounded-full">
                  View All Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resume Builder Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background" ref={resumeRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Resume Builder</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create a professional resume in minutes. Fill in your details below or upload your existing resume to get started.
              </p>
            </motion.div>
          </div>

          {/* Upload existing resume button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="bg-background rounded-lg p-6 shadow-md border border-border text-center">
              <h3 className="text-lg font-medium mb-3">Have an existing resume?</h3>
              <p className="text-muted-foreground mb-4">
                Upload your existing resume and we'll use AI to extract the information for you.
              </p>
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // Check file type
                  const allowedTypes = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  ];
                  if (!allowedTypes.includes(file.type)) {
                    setUploadError("Please upload a PDF  document");
                    return;
                  }

                  // Check file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    setUploadError("File size should be less than 5MB");
                    return;
                  }
                  
                  setResumeFile(file);
                  setUploadingResume(true);
                  setUploadProgress(0);
                  setUploadError(null);
                  
                  // Start progress animation
                  const progressInterval = setInterval(() => {
                    setUploadProgress(prev => {
                      if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90; // Hold at 90% until processing completes
                      }
                      return prev + 5;
                    });
                  }, 200);
                  
                  try {
                    // Create form data for upload
                    const formData = new FormData();
                    formData.append("file", file);
                    
                    // Parse resume data
                    const parseResponse = await fetch("/api/resume-parser", {
                      method: "POST",
                      body: formData,
                    });
                    
                    if (!parseResponse.ok) {
                      throw new Error("Failed to parse resume");
                    }
                    
                    const data = await parseResponse.json();
                    console.log("Parsed resume data:", data);
                    
                    // Process education data
                    const education = data.education || {};
                    const tenth = education.tenth || {};
                    const twelfth = education.twelfth || {};
                    
                    // Process the data to match our resume format
                    const processedData = {
                      personalInfo: {
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: "",
                      },
                      summary: "",
                      education: {
                        tenth: {
                          school: tenth.school || "",
                          year: tenth.year || "",
                          percentage: tenth.percentage || "",
                        },
                        twelfth: {
                          school: twelfth.school || "",
                          year: twelfth.year || "",
                          percentage: twelfth.percentage || "",
                        }
                      },
                      skills: Array.isArray(data.skills) 
                        ? data.skills 
                        : typeof data.skills === 'string'
                          ? (data.skills as string).split(',').map(s => s.trim()).filter(Boolean)
                          : [""],
                      experience: data.experience ? [
                        {
                          company: "",
                          position: "",
                          duration: data.experience || "",
                          description: "",
                        }
                      ] : [{ company: "", position: "", duration: "", description: "" }],
                      projects: [{ title: "", description: "", technologies: "", link: "" }],
                      achievements: [{ title: "", description: "", year: "" }],
                      certifications: [""],
                    };
                    
                    setResumeData(processedData);
                    
                    // Complete the progress
                    setUploadProgress(100);
                    
                    toast({
                      title: "Resume processed successfully",
                      description: "We've extracted information from your resume including your education details. Please review and complete any missing information.",
                      variant: "default",
                    });
                    
                  } catch (error) {
                    console.error("Error processing resume:", error);
                    clearInterval(progressInterval);
                    setUploadError("We couldn't extract information from your resume. Please try again or fill in details manually.");
                    toast({
                      title: "Error processing resume",
                      description: "We couldn't extract information from your resume. Please fill in the details manually.",
                      variant: "destructive",
                    });
                  } finally {
                    setUploadingResume(false);
                  }
                }}
              />
              
              {!resumeFile ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload existing resume
                </Button>
              ) : (
                <div className="mt-4 bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {uploadingResume ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      uploadProgress === 100 && <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  {(uploadingResume || uploadProgress > 0) && (
                    <div className="mt-3">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-right mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="mt-3 bg-destructive/10 p-3 rounded-lg flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">{uploadError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-background rounded-lg p-6 shadow-md border border-border"
            >
              <h3 className="text-xl font-semibold mb-4">Enter Your Details</h3>
              
              {/* Personal Information */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-primary">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="+91 0000000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.address}
                      onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                </div>
              </div>
              
              {/* Professional Summary */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-primary">Professional Summary</h4>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => handleInputChange("summary", null, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-24"
                  placeholder="A brief summary of your professional background and goals..."
                ></textarea>
              </div>
              
              {/* Education */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-primary">Education</h4>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-md bg-muted/20">
                    <h5 className="font-medium mb-2">10th Standard</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">School Name</label>
                        <input
                          type="text"
                          value={resumeData.education.tenth.school}
                          onChange={(e) => {
                            const updatedEducation: EducationEntry = {
                              ...resumeData.education.tenth,
                              school: e.target.value
                            };
                            handleInputChange("education", "tenth", updatedEducation);
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="High School Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                          type="text"
                          value={resumeData.education.tenth.year}
                          onChange={(e) => {
                            const updatedEducation: EducationEntry = {
                              ...resumeData.education.tenth,
                              year: e.target.value
                            };
                            handleInputChange("education", "tenth", updatedEducation);
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="2018"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Percentage/CGPA</label>
                        <input
                          type="text"
                          value={resumeData.education.tenth.percentage}
                          onChange={(e) => {
                            const updatedEducation: EducationEntry = {
                              ...resumeData.education.tenth,
                              percentage: e.target.value
                            };
                            handleInputChange("education", "tenth", updatedEducation);
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="85%"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-md bg-muted/20">
                    <h5 className="font-medium mb-2">12th Standard</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">School Name</label>
                        <input
                          type="text"
                          value={resumeData.education.twelfth.school}
                          onChange={(e) => {
                            const updatedEducation: EducationEntry = {
                              ...resumeData.education.twelfth,
                              school: e.target.value
                            };
                            handleInputChange("education", "twelfth", updatedEducation);
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Higher Secondary School"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                          type="text"
                          value={resumeData.education.twelfth.year}
                          onChange={(e) => {
                            const updatedEducation: EducationEntry = {
                              ...resumeData.education.twelfth,
                              year: e.target.value
                            };
                            handleInputChange("education", "twelfth", updatedEducation);
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Percentage/CGPA</label>
                        <input
                          type="text"
                          value={resumeData.education.twelfth.percentage}
                          onChange={(e) => {
                            const updatedEducation: EducationEntry = {
                              ...resumeData.education.twelfth,
                              percentage: e.target.value
                            };
                            handleInputChange("education", "twelfth", updatedEducation);
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="90%"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-primary">Skills</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addItem("skills")}
                    className="text-xs"
                  >
                    + Add Skill
                  </Button>
                </div>
                <div className="space-y-2">
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleInputChange("skills", null, e.target.value, index)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., JavaScript, Java, etc."
                      />
                      {resumeData.skills.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem("skills", index)}
                          className="h-10 w-10 flex-shrink-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Work Experience */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-primary">Work Experience</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addItem("experience")}
                    className="text-xs"
                  >
                    + Add Experience
                  </Button>
                </div>
                <div className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="p-4 border border-border rounded-md bg-muted/20">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium">Experience {index + 1}</h5>
                        {resumeData.experience.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem("experience", index)}
                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleInputChange("experience", "company", e.target.value, index)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleInputChange("experience", "position", e.target.value, index)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Job Title"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleInputChange("experience", "duration", e.target.value, index)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Jan 2020 - Present"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleInputChange("experience", "description", e.target.value, index)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                          placeholder="Describe your responsibilities and achievements..."
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Projects */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-primary">Projects</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addItem("projects")}
                    className="text-xs"
                  >
                    + Add Project
                  </Button>
                </div>
                <div className="space-y-4">
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="p-4 border border-border rounded-md bg-muted/20">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium">Project {index + 1}</h5>
                        {resumeData.projects.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem("projects", index)}
                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => handleInputChange("projects", "title", e.target.value, index)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Project Title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => handleInputChange("projects", "description", e.target.value, index)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                            placeholder="Describe the project..."
                          ></textarea>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Technologies</label>
                        <input
                          type="text"
                          value={project.technologies}
                          onChange={(e) => handleInputChange("projects", "technologies", e.target.value, index)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="e.g., React, Node.js, etc."
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Link</label>
                        <input
                          type="text"
                          value={project.link}
                          onChange={(e) => handleInputChange("projects", "link", e.target.value, index)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Achievements */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-primary">Achievements</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addItem("achievements")}
                    className="text-xs"
                  >
                    + Add Achievement
                  </Button>
                </div>
                <div className="space-y-4">
                  {resumeData.achievements.map((achievement, index) => (
                    <div key={index} className="p-4 border border-border rounded-md bg-muted/20">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium">Achievement {index + 1}</h5>
                        {resumeData.achievements.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem("achievements", index)}
                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => handleInputChange("achievements", "title", e.target.value, index)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Achievement Title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={achievement.description}
                            onChange={(e) => handleInputChange("achievements", "description", e.target.value, index)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                            placeholder="Describe the achievement..."
                          ></textarea>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                          type="text"
                          value={achievement.year}
                          onChange={(e) => handleInputChange("achievements", "year", e.target.value, index)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Certifications */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-primary">Certifications</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addItem("certifications")}
                    className="text-xs"
                  >
                    + Add Certification
                  </Button>
                </div>
                <div className="space-y-2">
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleInputChange("certifications", null, e.target.value, index)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., AWS Certified Developer, Google Analytics, etc."
                      />
                      {resumeData.certifications.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem("certifications", index)}
                          className="h-10 w-10 flex-shrink-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  size="lg" 
                  className="rounded-full"
                  onClick={generatePDF}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Resume as PDF
                </Button>
              </div>
            </motion.div>
            
            {/* Resume Preview Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-md border border-border relative"
            >
              <div className="absolute top-3 right-3 bg-muted/20 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                <File className="h-4 w-4 mr-1" />
                Preview
              </div>
              
              <div ref={resumePreviewRef} className="text-black pt-8">
                {/* Resume Preview Template */}
                <div className="border-b border-gray-300 pb-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{resumeData.personalInfo.name || "Your Name"}</h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                    {resumeData.personalInfo.email && (
                      <div>{resumeData.personalInfo.email}</div>
                    )}
                    {resumeData.personalInfo.phone && (
                      <div>• {resumeData.personalInfo.phone}</div>
                    )}
                    {resumeData.personalInfo.address && (
                      <div>• {resumeData.personalInfo.address}</div>
                    )}
                  </div>
                </div>
                
                {resumeData.summary && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-1">Profile Summary</h3>
                    <p className="text-sm text-gray-700">{resumeData.summary}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">Education</h3>
                  <div className="space-y-2">
                    {resumeData.education.twelfth.school && (
                      <div>
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-800">{resumeData.education.twelfth.school}</h4>
                          {resumeData.education.twelfth.year && (
                            <span className="text-gray-600 text-sm">{resumeData.education.twelfth.year}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">12th Standard {resumeData.education.twelfth.percentage && `• ${resumeData.education.twelfth.percentage}`}</p>
                      </div>
                    )}
                    
                    {resumeData.education.tenth.school && (
                      <div>
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-800">{resumeData.education.tenth.school}</h4>
                          {resumeData.education.tenth.year && (
                            <span className="text-gray-600 text-sm">{resumeData.education.tenth.year}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">10th Standard {resumeData.education.tenth.percentage && `• ${resumeData.education.tenth.percentage}`}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {resumeData.skills.some(skill => skill) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.filter(skill => skill).map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {resumeData.experience.some(exp => exp.company || exp.position) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">Work Experience</h3>
                    <div className="space-y-3">
                      {resumeData.experience.filter(exp => exp.company || exp.position).map((exp, index) => (
                        <div key={index}>
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800">{exp.position || "Position"}</h4>
                            {exp.duration && (
                              <span className="text-gray-600 text-sm">{exp.duration}</span>
                            )}
                          </div>
                          {exp.company && (
                            <p className="text-sm font-medium text-gray-700">{exp.company}</p>
                          )}
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {resumeData.projects.some(project => project.title || project.description) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">Projects</h3>
                    <div className="space-y-3">
                      {resumeData.projects.filter(project => project.title || project.description).map((project, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-800">{project.title}</h4>
                            {project.link && (
                              <a 
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                          )}
                          {project.technologies && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {project.technologies.split(',').map((tech, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {resumeData.achievements.some(achievement => achievement.title || achievement.description) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">Achievements</h3>
                    <div className="space-y-3">
                      {resumeData.achievements.filter(achievement => achievement.title || achievement.description).map((achievement, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                            {achievement.year && (
                              <span className="text-sm text-gray-600">{achievement.year}</span>
                            )}
                          </div>
                          {achievement.description && (
                            <p className="text-sm text-gray-700 mt-1">{achievement.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {resumeData.certifications.some(cert => cert) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">Certifications</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {resumeData.certifications.filter(cert => cert).map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear from HR professionals who have transformed their recruitment process with our platform.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i - 1) * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-lg p-6 shadow-sm border border-border"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <img
                      src={`user1.avif`}
                      alt={`Client ${i}`}
                      className="rounded-full w-12 h-12 object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold"> {i}</h4>
                    <p className="text-sm text-muted-foreground">HR Director, Company {i}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "This HR Management System has completely transformed our recruitment process. We've reduced our
                  time-to-hire by 60% and improved the quality of our candidates."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-yellow-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-foreground/30 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Recruitment Process?</h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Join thousands of companies that have streamlined their hiring with our AI-powered HR Management System.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="rounded-full bg-white text-primary hover:bg-white/90">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary-foreground/10 backdrop-blur-sm border-white/20 hover:bg-primary-foreground/20"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

