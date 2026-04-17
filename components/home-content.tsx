"use client"

import { useQuery } from "@tanstack/react-query"
import ClinicList from "@/components/clinic/ClinicList"
import AdvancedFilters from "@/components/search/AdvancedFilters"
import { Hero } from "@/components/luxury/Hero"
import { api } from "@/lib/api"
import { motion } from "framer-motion"

export default function HomeContent() {
  useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const clinics = await api.get<{ clinics: Array<{ city: string }> }>("/clinics?limit=1000")
      const totalClinics = clinics.clinics.length
      const cities = Array.from(new Set(clinics.clinics.map((c) => c.city)))
      return { totalClinics, citiesCount: cities.length }
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      <div className="relative z-10 bg-background -mt-20 rounded-t-[3rem] shadow-2xl border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <span className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4 block">
              Curated Collection
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
              Discover Excellence
            </h2>
            <div className="h-1 w-20 bg-gold mx-auto" />
            <p className="mt-8 text-lg text-muted-foreground font-light leading-relaxed">
              We have hand-picked the finest dental establishments in Turkey, ensuring
              world-class care, state-of-the-art technology, and unparalleled comfort.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <AdvancedFilters />
          </motion.div>

          {/* Results */}
          <ClinicList />

        </div>
      </div>
    </div>
  )
}
