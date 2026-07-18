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

export default function AdminSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I manage Super Admin credentials?",
      answer: "Super Admin credentials are currently seeded. If you need to change the password, you'll have to run a database update on the SuperAdmin table."
    },
    {
      question: "How does the Super Admin see all HR data?",
      answer: "The Super Admin dashboard connects directly to the core databases, bypassing the Clerk tenant restrictions. This allows you a complete view of all candidates, positions, and interviews."
    },
    {
      question: "Can I assign a normal user HR privileges?",
      answer: "Yes. In the User Management tab, locate the normal user and click the 'Make HR' button. This upgrades their role immediately."
    },
    {
      question: "Why do some buttons feel inactive?",
      answer: "As a Super Admin, your primary role is monitoring and system administration. Destructive actions or actions requiring a Clerk association (like applying for a job on a candidate's behalf) are restricted or view-only."
    },
    {
      question: "How do I export system reports?",
      answer: "Go to Analytics > Reports (Coming Soon). Select the type of report (e.g., hiring funnel, time-to-hire) and date range. Click 'Generate Report' and then 'Export' to download as PDF, CSV, or Excel file."
    }
  ]

  const resourceCategories = [
    {
      title: "System Administration",
      resources: [
        { title: "User Management", url: "/admin/users" },
        { title: "Authentication Flow", url: "#" },
        { title: "Security Protocols", url: "#" }
      ]
    },
    {
      title: "Monitoring Features",
      resources: [
        { title: "Global Candidates", url: "/admin/candidates" },
        { title: "Global Positions", url: "/admin/positions" },
        { title: "System Logs", url: "#" }
      ]
    },
    {
      title: "API Access",
      resources: [
        { title: "Admin API Keys", url: "#" },
        { title: "HR API Endpoints", url: "#" },
        { title: "Webhooks Integration", url: "#" }
      ]
    }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader heading="System Help & Support" text="Find answers, tutorials, and contact support." />

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
            <TabsTrigger value="faqs" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">System FAQs</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Dev Support</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Super Admin FAQ</CardTitle>
                <CardDescription>
                  Common questions and answers about the Super Admin capabilities.
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
                        className={`h-5 w-5 transition-transform ${openFaq === index ? "transform rotate-180" : ""
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
                <CardTitle>Contact Development Team</CardTitle>
                <CardDescription>
                  Get in touch with engineering for urgent system issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/20">
                    <Mail className="h-10 w-10 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-2">Email Engineering</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      Send an email to the dev team. Highest priority for Super Admins.
                    </p>
                    <Button>
                      <Mail className="mr-2 h-4 w-4" />
                      engineering@system.local
                    </Button>
                  </div>

                  <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/20">
                    <Phone className="h-10 w-10 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-2">On-Call Support</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      For urgent database issues or downtime, page the on-call engineer.
                    </p>
                    <Button>
                      <Phone className="mr-2 h-4 w-4" />
                      Page Engineering
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
                  Browse system guides and technical documentation.
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
