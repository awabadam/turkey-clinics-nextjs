import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background Image Parallax */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-background/60 z-10" /> {/* Overlay */}
        <img 
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=3868&auto=format&fit=crop" 
          alt="Luxury Dental Clinic" 
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl space-y-8"
        >
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground opacity-90">
            AESTHETIC
            <br />
            <span className="italic font-light">Perfection</span>
          </h1>
          
          <p className="mx-auto max-w-lg text-lg md:text-xl font-light tracking-wide text-muted-foreground">
            Curated dental experiences in Turkey's most prestigious clinics.
            Where medical excellence meets luxury tourism.
          </p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg tracking-wide transition-all duration-300 hover:scale-105"
            >
              Find a Clinic
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full px-8 py-6 text-lg tracking-wide backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Our Story
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground dark:text-foreground/80">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-4 w-4 text-muted-foreground dark:text-foreground/80" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
