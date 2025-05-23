"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HelpCircle, 
  Mail, 
  FileText, 
  MessagesSquare, 
  Phone, 
  ChevronDown, 
  Search,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I upload a resume for parsing?",
      answer: "Go to the job application page or candidate creation form. Click the 'Upload Resume' button and select your PDF or Word document. Our AI will automatically extract information such as contact details, skills, education, and experience."
    },
    {
      question: "How does the candidate matching algorithm work?",
      answer: "Our AI analyzes the job requirements and compares them with candidate profiles. It evaluates skills, experience, education, and other factors to generate a match score. Candidates with higher scores are more likely to be a good fit for the position."
    },
    {
      question: "How do I schedule interviews?",
      answer: "Go to a candidate's profile and click 'Schedule Interview'. Select the date, time, and interview type (in-person, phone, or video). You can also add other team members as interviewers. The system will automatically send calendar invites to all participants."
    },
    {
      question: "Can I customize the application form?",
      answer: "Yes, go to Settings > Application Forms. Here, you can add custom fields, make fields required or optional, and rearrange the order of sections. Changes will be reflected in all future application forms."
    },
    {
      question: "How do I export reports?",
      answer: "Go to Analytics > Reports. Select the type of report (e.g., hiring funnel, time-to-hire) and date range. Click 'Generate Report' and then 'Export' to download as PDF, CSV, or Excel file."
    },
    {
      question: "What should I do if the resume parser misses information?",
      answer: "While our AI is advanced, it may occasionally miss or incorrectly extract information from complex resume formats. You can manually edit any parsed information in the candidate profile or during the application review stage."
    },
  ]

  const resourceCategories = [
    {
      title: "Getting Started",
      resources: [
        { title: "System Overview", url: "/docs/overview" },
        { title: "Creating Your First Job Posting", url: "/docs/job-posting" },
        { title: "Managing Applications", url: "/docs/applications" }
      ]
    },
    {
      title: "Advanced Features",
      resources: [
        { title: "AI Resume Parsing", url: "/docs/resume-parsing" },
        { title: "Candidate Scoring Algorithm", url: "/docs/scoring" },
        { title: "Interview Scheduling", url: "/docs/interviews" }
      ]
    },
    {
      title: "System Administration",
      resources: [
        { title: "User Management", url: "/docs/users" },
        { title: "Custom Fields", url: "/docs/fields" },
        { title: "API Documentation", url: "/docs/api" }
      ]
    }
  ]

  return (
    <DashboardShell>
      <DashboardHeader heading="Help & Support" text="Find answers, tutorials, and contact support." />
      
      <div className="grid gap-6">
        {/* Search */}
        <Card>
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-10"
              />
            </div>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="faqs" className="w-full">
          <TabsList className="w-full justify-start border-b pb-0 mb-6">
            <TabsTrigger value="faqs" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">FAQs</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Contact Support</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions and answers about the HR management system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      className="flex justify-between w-full items-center p-4 text-left"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="font-medium">{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          openFaq === index ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 text-muted-foreground"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team for assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/20">
                    <Mail className="h-10 w-10 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-2">Email Support</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      Send an email to our support team. We usually respond within 24 hours.
                    </p>
                    <Button>
                      <Mail className="mr-2 h-4 w-4" />
                      support@hrms.example.com
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/20">
                    <MessagesSquare className="h-10 w-10 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-2">Live Chat</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      Chat with our support agents in real-time. Available Monday to Friday, 9am to 5pm.
                    </p>
                    <Button>
                      <MessagesSquare className="mr-2 h-4 w-4" />
                      Start Live Chat
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/20">
                    <Phone className="h-10 w-10 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-2">Phone Support</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      For urgent issues, call our support hotline. Available 24/7.
                    </p>
                    <Button>
                      <Phone className="mr-2 h-4 w-4" />
                      +1 (800) 123-4567
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/20">
                    <HelpCircle className="h-10 w-10 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-2">Request Training</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      Schedule a personalized training session for you or your team.
                    </p>
                    <Button>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Request Training
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle>Documentation & Resources</CardTitle>
                <CardDescription>
                  Browse our comprehensive guides and tutorials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {resourceCategories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-5">
                      <h3 className="font-medium text-lg mb-4">{category.title}</h3>
                      <ul className="space-y-3">
                        {category.resources.map((resource, rIndex) => (
                          <li key={rIndex}>
                            <a 
                              href={resource.url} 
                              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              {resource.title}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 border rounded-lg bg-muted/20 flex flex-col items-center text-center">
                  <FileText className="h-10 w-10 text-primary mb-3" />
                  <h3 className="text-lg font-medium mb-2">Full Documentation</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Access our complete documentation portal with detailed guides, tutorials, and API references.
                  </p>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Video Tutorials */}
        <Card>
          <CardHeader>
            <CardTitle>Video Tutorials</CardTitle>
            <CardDescription>
              Watch step-by-step video guides for common tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Getting Started Guide", duration: "5:32" },
                { title: "Resume Parsing Tutorial", duration: "4:17" },
                { title: "Interview Scheduling", duration: "6:45" }
              ].map((video, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Button variant="outline" className="rounded-full h-12 w-12 p-0">
                        <span className="sr-only">Play</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 ml-1"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium truncate">{video.title}</h4>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
} 