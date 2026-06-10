"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FileSearch, Users, Calendar, BarChart4 } from "lucide-react"

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

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
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
              animate={isInView ? { opacity: 1, y: 0 } : {}}
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
  )
}
