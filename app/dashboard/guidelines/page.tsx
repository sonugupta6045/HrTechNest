"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  ChevronDown, 
  Search,
  Download,
  Bookmark,
  Info,
  CheckCircle,
  Clock,
  CalendarCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to format dates nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper to get a date N days ago in ISO format
const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export default function GuidelinesPage() {
  const [openSection, setOpenSection] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [guidelineData, setGuidelineData] = useState<any>(null)
  
  // Simulate fetching data from database
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const today = getTodayDate();
      const guidelineCategories = [
        {
          title: "Hiring Process",
          icon: CheckCircle,
          description: "Guidelines for ensuring a fair and effective hiring process",
          guidelines: [
            {
              title: "Job Description Creation",
              content: "All job descriptions should be clear, inclusive, and accurately reflect the responsibilities and requirements of the position. Avoid using gendered language or terms that could discourage diverse candidates. Include salary ranges and benefits information when possible.",
              updated: getDateDaysAgo(5)
            },
            {
              title: "Candidate Screening",
              content: "Use consistent criteria when screening resumes and applications. The AI matching score should be used as a guide but not as the sole determinant for advancing candidates. Always review applications manually to ensure qualified candidates aren't overlooked.",
              updated: getDateDaysAgo(1)
            },
            {
              title: "Interview Process",
              content: "Prepare structured interview questions in advance to ensure consistency across candidates. Include a diverse panel of interviewers when possible. Document feedback promptly after each interview using the evaluation form in the system.",
              updated: getDateDaysAgo(7)
            },
            {
              title: "Candidate Selection",
              content: "Make hiring decisions based on qualifications, skills, and alignment with company values. Document the reasons for selection to maintain transparency. Notify all candidates of their status in a timely manner.",
              updated: getDateDaysAgo(3)
            }
          ]
        },
        {
          title: "Onboarding",
          icon: CalendarCheck,
          description: "Best practices for employee onboarding and integration",
          guidelines: [
            {
              title: "Pre-arrival Preparation",
              content: "Send welcome email one week before start date with first-day instructions. Prepare workstation, system access, and required equipment. Assign a buddy or mentor to help the new employee navigate their first weeks.",
              updated: getDateDaysAgo(2)
            },
            {
              title: "First Day",
              content: "Schedule a team welcome and introduction. Provide office tour and emergency procedures. Review the onboarding timeline and expectations. Complete any remaining paperwork and ensure system access is working.",
              updated: getTodayDate()
            },
            {
              title: "First Week",
              content: "Schedule training sessions for essential systems and tools. Arrange introductory meetings with key stakeholders. Review job responsibilities and performance expectations. Check in daily for questions and concerns.",
              updated: getDateDaysAgo(10)
            },
            {
              title: "First Month",
              content: "Conduct weekly check-ins to address questions and provide feedback. Ensure role clarity and adjust as needed. Complete required training modules. Set 30/60/90 day goals and objectives.",
              updated: getDateDaysAgo(4)
            }
          ]
        },
        {
          title: "Compliance",
          icon: Info,
          description: "Legal requirements and compliance guidelines",
          guidelines: [
            {
              title: "Equal Employment Opportunity",
              content: "All hiring practices must comply with EEO regulations. Document all hiring decisions with clear reasoning. Ensure job requirements are necessary for the position and don't inadvertently exclude protected groups.",
              updated: getDateDaysAgo(15)
            },
            {
              title: "Data Privacy",
              content: "Candidate and employee data should be handled according to relevant data protection laws (GDPR, CCPA, etc.). Obtain consent before collecting personal information. Limit access to sensitive information to authorized personnel only.",
              updated: getDateDaysAgo(8)
            },
            {
              title: "Document Retention",
              content: "Application materials for unsuccessful candidates should be retained for one year. Employee records should be maintained for the duration of employment plus three years. Regularly audit and securely destroy records that exceed retention periods.",
              updated: getDateDaysAgo(20)
            },
            {
              title: "Reasonable Accommodations",
              content: "Provide reasonable accommodations for qualified individuals with disabilities throughout the application and employment process. Document accommodation requests and responses. Consult with legal department when questions arise.",
              updated: getDateDaysAgo(12)
            }
          ]
        }
      ];
      
      const recentUpdates = [
        {
          title: "Remote Work Policy Updated",
          date: getDateDaysAgo(0),
          description: "Guidelines for remote work arrangements have been updated to include new equipment requirements and security protocols."
        },
        {
          title: "New Interview Question Bank",
          date: getDateDaysAgo(2),
          description: "A new set of behavioral and technical interview questions has been added to the guidelines for various roles."
        },
        {
          title: "Updated Compliance Training Requirements",
          date: getDateDaysAgo(5),
          description: "Annual compliance training requirements have been updated to include new modules on data privacy and security."
        }
      ];
      
      setGuidelineData({ guidelineCategories, recentUpdates });
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="HR Guidelines" text="Company policies, procedures and best practices for HR processes" />
        <div className="grid gap-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="HR Guidelines" text="Company policies, procedures and best practices for HR processes" />
      
      <div className="grid gap-6">
        {/* Search */}
        <Card>
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search guidelines..." 
                className="pl-10"
              />
            </div>
          </CardHeader>
        </Card>
        
        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Updates
            </CardTitle>
            <CardDescription>
              Recently updated guidelines and policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {guidelineData.recentUpdates.map((update: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{update.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {update.date === getTodayDate() ? "Today" : formatDate(update.date)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Guidelines Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b pb-0 mb-6">
            <TabsTrigger value="all" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">All Guidelines</TabsTrigger>
            <TabsTrigger value="hiring" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Hiring</TabsTrigger>
            <TabsTrigger value="onboarding" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Onboarding</TabsTrigger>
            <TabsTrigger value="compliance" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Compliance</TabsTrigger>
          </TabsList>
          
          {/* All Guidelines Tab */}
          <TabsContent value="all">
            <div className="grid gap-6">
              {guidelineData.guidelineCategories.map((category: any, catIndex: number) => (
                <Card key={catIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                    <CardDescription>
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.guidelines.map((guideline: any, index: number) => (
                      <div key={index} className="border rounded-lg">
                        <button
                          className="flex justify-between w-full items-center p-4 text-left"
                          onClick={() => toggleSection(catIndex * 100 + index)}
                        >
                          <span className="font-medium">{guideline.title}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-4">
                              Updated: {guideline.updated === getTodayDate() ? "Today" : formatDate(guideline.updated)}
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 transition-transform ${
                                openSection === (catIndex * 100 + index) ? "transform rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>
                        {openSection === (catIndex * 100 + index) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4 text-muted-foreground"
                          >
                            {guideline.content}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download {category.title} Guidelines
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Hiring Tab */}
          <TabsContent value="hiring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Hiring Process
                </CardTitle>
                <CardDescription>
                  Guidelines for ensuring a fair and effective hiring process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {guidelineData.guidelineCategories[0].guidelines.map((guideline: any, index: number) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      className="flex justify-between w-full items-center p-4 text-left"
                      onClick={() => toggleSection(index)}
                    >
                      <span className="font-medium">{guideline.title}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-4">
                          Updated: {guideline.updated === getTodayDate() ? "Today" : formatDate(guideline.updated)}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            openSection === index ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {openSection === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 text-muted-foreground"
                      >
                        {guideline.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Hiring Guidelines
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onboarding Tab */}
          <TabsContent value="onboarding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Onboarding
                </CardTitle>
                <CardDescription>
                  Best practices for employee onboarding and integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {guidelineData.guidelineCategories[1].guidelines.map((guideline: any, index: number) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      className="flex justify-between w-full items-center p-4 text-left"
                      onClick={() => toggleSection(100 + index)}
                    >
                      <span className="font-medium">{guideline.title}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-4">
                          Updated: {guideline.updated === getTodayDate() ? "Today" : formatDate(guideline.updated)}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            openSection === (100 + index) ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {openSection === (100 + index) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 text-muted-foreground"
                      >
                        {guideline.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Onboarding Guidelines
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Compliance
                </CardTitle>
                <CardDescription>
                  Legal requirements and compliance guidelines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {guidelineData.guidelineCategories[2].guidelines.map((guideline: any, index: number) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      className="flex justify-between w-full items-center p-4 text-left"
                      onClick={() => toggleSection(200 + index)}
                    >
                      <span className="font-medium">{guideline.title}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-4">
                          Updated: {guideline.updated === getTodayDate() ? "Today" : formatDate(guideline.updated)}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            openSection === (200 + index) ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {openSection === (200 + index) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 text-muted-foreground"
                      >
                        {guideline.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Compliance Guidelines
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Additional Resources
            </CardTitle>
            <CardDescription>
              Company policies and reference materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Employee Handbook", description: "Complete company policies and procedures" },
                { title: "Compensation Guidelines", description: "Salary bands, bonus structure, and equity guidelines" },
                { title: "Performance Review Templates", description: "Standardized templates for different roles" },
                { title: "Exit Interview Process", description: "Guidelines for conducting exit interviews" },
                { title: "Remote Work Policy", description: "Policies for remote and hybrid work arrangements" },
                { title: "Benefits Overview", description: "Summary of employee benefits and eligibility" }
              ].map((resource, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Document
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
} 