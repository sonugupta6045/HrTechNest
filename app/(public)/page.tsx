"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import JobListings from "@/components/job-listings"

// Modular Components
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { Stats } from "@/components/landing/Stats"
import { ResumeBuilder } from "@/components/landing/ResumeBuilder"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <Stats />

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
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
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

          <ResumeBuilder />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your hiring?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join hundreds of companies using HrTechNest to build their dream teams.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="rounded-full font-bold">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
