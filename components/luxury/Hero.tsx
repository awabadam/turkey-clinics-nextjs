"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowDown, Sparkles, Shield, Globe } from "lucide-react"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: "smooth",
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0b]"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/70 via-[#0a0a0b]/40 to-[#0a0a0b]/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/60 via-transparent to-[#0a0a0b]/40 z-10" />

        {/* Warm gold tint overlay */}
        <div className="absolute inset-0 z-10 mix-blend-soft-light bg-gradient-to-br from-amber-900/20 via-transparent to-emerald-900/10" />

        <img
          src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=3870&auto=format&fit=crop"
          alt="Modern dental clinic interior"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-[15%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute top-0 left-[85%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* Corner accent */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="h-px w-12 bg-[#c9973b]/60" />
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9973b]/70 font-light">
          Est. 2024
        </span>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 flex h-full flex-col items-center justify-center px-6"
      >
        <div className="max-w-5xl w-full space-y-10">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9973b]/60" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#c9973b] font-medium">
                Turkey&apos;s Premier Dental Guide
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9973b]/60" />
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h1 className="font-serif leading-[0.9] tracking-[-0.03em]">
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold text-white/90">
                Your Smile,
              </span>
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light italic text-[#c9973b]/90 mt-1">
                Perfected
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mx-auto max-w-xl text-center text-base md:text-lg font-light leading-relaxed text-white/50 tracking-wide"
          >
            Discover world-class dental clinics across Turkey.
            Compare treatments, read verified reviews, and book
            with confidence.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex justify-center pt-2"
          >
            <button
              onClick={scrollToContent}
              className="group relative overflow-hidden rounded-full bg-[#c9973b] px-10 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#0a0a0b] transition-all duration-500 hover:bg-[#d4a855] hover:shadow-[0_0_40px_rgba(201,151,59,0.3)]"
            >
              <span className="relative z-10">Explore Clinics</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4a855] to-[#c9973b] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-8 pt-8"
          >
            {[
              { icon: Shield, text: "Verified Clinics" },
              { icon: Sparkles, text: "Premium Care" },
              { icon: Globe, text: "International Patients" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-white/30"
              >
                <Icon className="h-3.5 w-3.5 text-[#c9973b]/50" />
                <span className="text-[11px] uppercase tracking-[0.15em] font-light">
                  {text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-3 cursor-pointer"
          onClick={scrollToContent}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-light">
            Discover
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-4 w-4 text-[#c9973b]/40" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
    </div>
  )
}
