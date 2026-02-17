import { Badge } from "@/components/ui/badge";
import { Award, Star, TrendingUp, Calendar } from "lucide-react";

interface TrustBadgesProps {
  clinic: {
    averageRating?: number;
    establishedYear?: number | null;
    _count?: {
      reviews: number;
      favorites?: number;
    };
    featured?: boolean;
  };
}

export function TrustBadges({ clinic }: TrustBadgesProps) {
  const badges = [];

  // Verified badge (if featured)
  if (clinic.featured) {
    badges.push({
      icon: Award,
      label: "Verified",
      color: "default",
    });
  }

  // High rating badge
  if (clinic.averageRating && clinic.averageRating >= 4.5) {
    badges.push({
      icon: Star,
      label: "Highly Rated",
      color: "default",
    });
  }

  // Years in business badge
  if (clinic.establishedYear) {
    const yearsInBusiness =
      new Date().getFullYear() - clinic.establishedYear;
    if (yearsInBusiness >= 5) {
      badges.push({
        icon: Calendar,
        label: `${yearsInBusiness}+ Years`,
        color: "secondary",
      });
    }
  }

  // Popular badge (if many reviews)
  if (clinic._count?.reviews && clinic._count.reviews >= 50) {
    badges.push({
      icon: TrendingUp,
      label: "Popular",
      color: "secondary",
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Badge key={index} variant={badge.color as any} className="gap-1">
          <badge.icon className="h-3 w-3" />
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
