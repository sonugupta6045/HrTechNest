"use client"

import type React from "react"
import { use } from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { ResumePreview } from "@/components/resume-preview"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, FileText, User, Mail, Phone, Briefcase, CheckCircle, BookOpen, GraduationCap, Calendar, Percent, Building } from "lucide-react"

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(1)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingResume, setIsProcessingResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState("")
  const [parsedData, setParsedData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    candidateId: "",
    resumeUrl: "",
    coverLetter: "",
    matchScore: 0,
    tenthSchool: "",
    tenthYear: "",
    tenthPercentage: "",
    twelfthSchool: "",
    twelfthYear: "",
    twelfthPercentage: "",
  })

  // Wrap handleResumeUpload in useCallback to prevent recreation on each render
  const handleResumeUpload = useCallback(async (file: File) => {
    try {
      setIsProcessingResume(true)
      // Upload to Cloudinary through our API
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const uploadData = await uploadResponse.json()
      console.log("Upload response:", uploadData)
      setResumeUrl(uploadData.secure_url)

      // Parse resume data using our Gemini-powered endpoint
      const parseFormData = new FormData()
      parseFormData.append("file", file)

      const parseResponse = await fetch("/api/resume-parser", {
        method: "POST",
        body: parseFormData,
      })

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        throw new Error(errorData.error || "Failed to parse resume")
      }

      const data = await parseResponse.json()
      console.log("Parse response:", data)
      
      // Validate parsed data
      if (!data.name || !data.email) {
        toast({
          title: "Warning",
          description: "Some information could not be extracted from your resume. Please review and update the information below.",
          variant: "default",
        })
      }

      // Process skills if it's an array (from Gemini API) or string (from traditional parser)
      let skillsString = "";
      if (Array.isArray(data.skills)) {
        skillsString = data.skills.join(", ");
      } else if (typeof data.skills === 'string') {
        skillsString = data.skills;
      }

      // Process education data
      const education = data.education || {};
      const tenth = education.tenth || {};
      const twelfth = education.twelfth || {};

      // Update form data
      const updatedData = {
        ...parsedData,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        skills: skillsString,
        experience: data.experience || "",
        candidateId: data.candidateId,
        resumeUrl: uploadData.secure_url,
        matchScore: data.matchScore || 0,
        tenthSchool: tenth.school || "",
        tenthYear: tenth.year || "",
        tenthPercentage: tenth.percentage || "",
        twelfthSchool: twelfth.school || "",
        twelfthYear: twelfth.year || "",
        twelfthPercentage: twelfth.percentage || "",
      }

      console.log("Updated form data:", updatedData)
      setParsedData(updatedData)
      setResumeUploaded(true)
      toast({
        title: "Resume uploaded successfully",
        description: "We've extracted your information using AI. Please review and make any necessary changes.",
        variant: "default",
      })
      setStep(2)
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload or parse resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingResume(false)
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!parsedData.name || !parsedData.email || !parsedData.resumeUrl) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields before submitting.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Prepare the data for submission
      const applicationData = {
        jobId: resolvedParams.id,
        resumeUrl: parsedData.resumeUrl,
        coverLetter: parsedData.coverLetter || "",
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone || "",
        skills: parsedData.skills.split(",").map(s => s.trim()).filter(Boolean),
        experience: parsedData.experience || "",
        matchScore: parsedData.matchScore || 0,
        tenthSchool: parsedData.tenthSchool || "",
        tenthYear: parsedData.tenthYear || "",
        tenthPercentage: parsedData.tenthPercentage || "",
        twelfthSchool: parsedData.twelfthSchool || "",
        twelfthYear: parsedData.twelfthYear || "",
        twelfthPercentage: parsedData.twelfthPercentage || "",
      }

      console.log("Submitting application data:", applicationData)

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Application submission error:", response.status, response.statusText);
        
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
        } catch (error) {
          console.error("Failed to parse error response:", error);
        }
        
        throw new Error("Failed to submit application");
      }
      

      console.log("Application submitted successfully:", data)

      toast({
        title: "Application submitted successfully",
        description: "Your application has been received. We'll review it and get back to you soon.",
        variant: "default",
      })

      router.push(`/jobs/${resolvedParams.id}/apply/success`)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setParsedData((prev) => ({ ...prev, [name]: value }))
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="bg-muted/30 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            href={`/jobs/${resolvedParams.id}`}
            className="inline-flex items-center text-sm hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to job details
          </Link>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Apply for Position</CardTitle>
              <CardDescription>Complete the application process to apply for this position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                      <div
                        className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="ml-2 font-medium">Resume</span>
                    </div>
                    <div
                      className={`flex-1 border-t-2 mx-4 ${step >= 2 ? "border-primary" : "border-muted-foreground"}`}
                    ></div>
                    <div className={`flex items-center ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                      <div
                        className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                      >
                        <User className="h-5 w-5" />
                      </div>
                      <span className="ml-2 font-medium">Review</span>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs value={`step-${step}`} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="step-1" disabled={step !== 1} onClick={() => setStep(1)}>
                    Upload Resume
                  </TabsTrigger>
                  <TabsTrigger value="step-2" disabled={!resumeUploaded} onClick={() => resumeUploaded && setStep(2)}>
                    Review Information
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <TabsContent value="step-1" className="py-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="bg-muted/50 rounded-lg p-6 border border-border">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-primary" />
                            Upload Your Resume
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Please upload your resume. We'll automatically extract your information to make the
                            application process easier. We are only support PDF documents.
                          </p>
                          <div className="relative">
                            <FileUploader onFileUpload={handleResumeUpload} />
                            {isProcessingResume && (
                              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
                                <svg
                                  className="animate-spin h-10 w-10 text-primary mb-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <p className="text-sm font-medium">Processing your resume...</p>
                                <p className="text-xs text-muted-foreground mt-1">Extracting information using AI</p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-4">
                            <Link href={`/jobs/${resolvedParams.id}`}>
                              <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                              </Button>
                            </Link>
                            <Button onClick={() => resumeUploaded && setStep(2)} disabled={!resumeUploaded}>
                              Continue
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                      </motion.div>
                    </TabsContent>
                  )}

                  {step === 2 && (
                    <TabsContent value="step-2" className="py-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium">Resume Preview</h3>
                            {resumeUrl && <ResumePreview resumeUrl={resumeUrl} candidateName={parsedData.name} />}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="flex items-center">
                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                Full Name
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                value={parsedData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Your full name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email" className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                Email
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={parsedData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="your.email@example.com"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              Phone
                            </Label>
                            <Input 
                              id="phone" 
                              name="phone" 
                              value={parsedData.phone} 
                              onChange={handleInputChange}
                              placeholder="Your phone number"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="skills" className="flex items-center">
                              <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                              Skills
                            </Label>
                            <Textarea
                              id="skills"
                              name="skills"
                              value={parsedData.skills}
                              onChange={handleInputChange}
                              required
                              placeholder="Your skills (comma-separated)"
                            />
                          </div>

                          {/* Education Section */}
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <GraduationCap className="mr-2 h-5 w-5 text-muted-foreground" />
                              <h3 className="text-lg font-medium">Education</h3>
                            </div>
                            
                            {/* 10th Standard */}
                            <div className="bg-muted/20 rounded-md p-4 border border-border">
                              <h4 className="font-medium mb-3 flex items-center">
                                <BookOpen className="mr-2 h-4 w-4 text-primary" />
                                10th Standard
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="tenthSchool" className="flex items-center">
                                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                                    School
                                  </Label>
                                  <Input
                                    id="tenthSchool"
                                    name="tenthSchool"
                                    value={parsedData.tenthSchool}
                                    onChange={handleInputChange}
                                    placeholder="School name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="tenthYear" className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Year
                                  </Label>
                                  <Input
                                    id="tenthYear"
                                    name="tenthYear"
                                    value={parsedData.tenthYear}
                                    onChange={handleInputChange}
                                    placeholder="Year of completion"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="tenthPercentage" className="flex items-center">
                                    <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Percentage/CGPA
                                  </Label>
                                  <Input
                                    id="tenthPercentage"
                                    name="tenthPercentage"
                                    value={parsedData.tenthPercentage}
                                    onChange={handleInputChange}
                                    placeholder="Percentage or CGPA"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* 12th Standard */}
                            <div className="bg-muted/20 rounded-md p-4 border border-border">
                              <h4 className="font-medium mb-3 flex items-center">
                                <BookOpen className="mr-2 h-4 w-4 text-primary" />
                                12th Standard
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="twelfthSchool" className="flex items-center">
                                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                                    School
                                  </Label>
                                  <Input
                                    id="twelfthSchool"
                                    name="twelfthSchool"
                                    value={parsedData.twelfthSchool}
                                    onChange={handleInputChange}
                                    placeholder="School name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="twelfthYear" className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Year
                                  </Label>
                                  <Input
                                    id="twelfthYear"
                                    name="twelfthYear"
                                    value={parsedData.twelfthYear}
                                    onChange={handleInputChange}
                                    placeholder="Year of completion"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="twelfthPercentage" className="flex items-center">
                                    <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Percentage/CGPA
                                  </Label>
                                  <Input
                                    id="twelfthPercentage"
                                    name="twelfthPercentage"
                                    value={parsedData.twelfthPercentage}
                                    onChange={handleInputChange}
                                    placeholder="Percentage or CGPA"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="experience" className="flex items-center">
                              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                              Experience
                            </Label>
                            <Textarea
                              id="experience"
                              name="experience"
                              value={parsedData.experience}
                              onChange={handleInputChange}
                              required
                              rows={4}
                              placeholder="Your work experience"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="coverLetter" className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              Cover Letter (Optional)
                            </Label>
                            <Textarea
                              id="coverLetter"
                              name="coverLetter"
                              value={parsedData.coverLetter}
                              onChange={handleInputChange}
                              placeholder="Tell us why you're interested in this position and why you'd be a good fit."
                              rows={6}
                            />
                          </div>

                          <div className="flex justify-between items-center pt-4">
                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  Submit Application
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    </TabsContent>
                  )}
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
