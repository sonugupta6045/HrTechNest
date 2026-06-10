"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
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
  )
}
