import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LuxuryImage } from "@/components/luxury/LuxuryImage";

interface ClinicCardProps {
  clinic: any;
  index: number;
}

export function ClinicCard({ clinic, index }: ClinicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-border transition-colors"
    >
      <Link to="/clinics/$slug" params={{ slug: clinic.slug }} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {clinic.images.length > 0 ? (
            <LuxuryImage
              src={clinic.images[0]}
              alt={clinic.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          {/* Floating Action Button */}
          <div className="absolute top-4 right-4 z-10 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <ArrowUpRight className="h-5 w-5 text-black" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {clinic.featured && (
              <Badge className="bg-gold text-black border-none font-medium">Featured</Badge>
            )}
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-black border-none font-medium">
              {clinic.city}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-serif font-semibold tracking-tight mb-1 group-hover:text-gold transition-colors">
                {clinic.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {clinic.address}
              </p>
            </div>
            {clinic.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-sm font-medium">{clinic.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {clinic.procedures && clinic.procedures.length > 0 ? (
                <span>From <span className="text-foreground font-semibold">${Math.min(...clinic.procedures.map((p: any) => p.averagePrice || 99999))}</span></span>
              ) : (
                <span>Contact for pricing</span>
              )}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              View Details
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
