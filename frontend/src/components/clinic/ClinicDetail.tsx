import { useState } from "react";
import { motion } from "framer-motion";
import BookingForm from "./BookingForm";
import ReviewForm from "./ReviewForm";
import { ClinicGallery } from "./ClinicGallery";
import { BeforeAfterGallery } from "./BeforeAfterGallery";
import { ProcedurePricing } from "./ProcedurePricing";
import { FavoriteButton } from "./FavoriteButton";
import { useComparison } from "./ComparisonTool";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Globe, Star, Calendar as CalendarIcon, Users, CheckCircle2, Languages, Award } from "lucide-react";
import type { Clinic } from "@/hooks/useClinics";
import { LuxuryImage } from "@/components/luxury/LuxuryImage";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  reviewCategories?: {
    cleanliness?: number;
    staff?: number;
    results?: number;
    value?: number;
  } | null;
  reviewImages?: string[];
  verified?: boolean;
  clinicResponse?: string;
}

interface Procedure {
  id: string;
  name: string;
  description: string | null;
  averagePrice: number | null;
  clinicId: string;
}

interface ClinicDetailProps {
  clinic: Clinic & {
    reviews: Review[];
    procedures?: Procedure[];
    _count?: { reviews: number };
  };
}

export function ClinicDetail({ clinic }: ClinicDetailProps) {
  const { comparisonList, addToComparison } = useComparison();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const averageRating =
    clinic.reviews.length > 0
      ? (
          clinic.reviews.reduce((sum, review) => sum + review.rating, 0) /
          clinic.reviews.length
        ).toFixed(1)
      : "0";

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Immersive Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {clinic.images.length > 0 ? (
          <LuxuryImage
            src={clinic.images[0]}
            alt={clinic.name}
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <MapPin className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <div className="container mx-auto max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-gold text-black border-none px-3 py-1 text-sm font-medium">
                  {clinic.city}
                </Badge>
                {clinic.reviews.length > 0 && (
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/10">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{averageRating}</span>
                    <span className="text-white/70 text-sm">({clinic.reviews.length} reviews)</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight shadow-sm">
                {clinic.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-lg">
                <MapPin className="h-5 w-5" />
                <span>{clinic.address}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* About Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6">About the Clinic</h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {clinic.description || "No description available."}
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Stats */}
                <div className="space-y-6">
                  {(clinic.establishedYear || clinic.doctorCount) && (
                    <div className="grid grid-cols-2 gap-4">
                      {clinic.establishedYear && (
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                          <CalendarIcon className="h-6 w-6 text-gold mb-2" />
                          <p className="text-sm text-muted-foreground">Established</p>
                          <p className="font-semibold">{clinic.establishedYear}</p>
                        </div>
                      )}
                      {clinic.doctorCount && (
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                          <Users className="h-6 w-6 text-gold mb-2" />
                          <p className="text-sm text-muted-foreground">Team</p>
                          <p className="font-semibold">{clinic.doctorCount} Specialists</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Highlights (Languages & Certs) */}
                <div className="space-y-6">
                  {clinic.languages && clinic.languages.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold mb-3">
                        <Languages className="h-4 w-4 text-gold" />
                        Languages Spoken
                      </h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {clinic.languages.map((lang) => (
                          <div key={lang} className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
                            <span>{lang}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(clinic.certifications?.length > 0 || clinic.accreditations?.length > 0) && (
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold mb-3">
                        <Award className="h-4 w-4 text-gold" />
                        Accreditations
                      </h3>
                      <div className="space-y-2">
                        {[...(clinic.certifications || []), ...(clinic.accreditations || [])].map((cert) => (
                          <div key={cert} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Gallery */}
            {(clinic.images.length > 1 || (clinic.beforeAfterImages && clinic.beforeAfterImages.length > 0)) && (
              <section>
                {clinic.images.length > 1 && (
                  <ClinicGallery images={clinic.images} title="Clinic Gallery" />
                )}
                
                {clinic.beforeAfterImages && clinic.beforeAfterImages.length > 0 && (
                  <div className="mt-12">
                    {/* Title removed to avoid duplication with component */}
                    <BeforeAfterGallery images={clinic.beforeAfterImages} />
                  </div>
                )}
              </section>
            )}

            {/* Procedures & Pricing */}
            {clinic.procedures && clinic.procedures.length > 0 && (
              <section>
                {/* Title removed to avoid duplication with component */}
                <ProcedurePricing procedures={clinic.procedures} clinicId={clinic.id} />
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-serif font-bold">Patient Reviews</h2>
                <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline">
                  Write a Review
                </Button>
              </div>

              {showReviewForm && (
                <div className="mb-8 p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <ReviewForm clinicId={clinic.id} />
                </div>
              )}

              <div className="space-y-6">
                {clinic.reviews.length > 0 ? (
                  clinic.reviews.map((review) => (
                    <div key={review.id} className="pb-8 border-b border-border/50 last:border-0">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg">
                            {review.user.name?.[0] || "A"}
                          </div>
                          <div>
                            <p className="font-semibold">{review.user.name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-gold text-gold" />
                          <span className="font-bold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground italic mb-4">&quot;{review.comment}&quot;</p>
                      {review.reviewCategories && (
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {Object.entries(review.reviewCategories).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </div>
            </section>

          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              
              {/* Booking Card */}
              <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden ring-1 ring-black/5">
                <div className="bg-primary p-6 text-primary-foreground">
                  <h3 className="text-xl font-serif font-bold mb-1">Book Appointment</h3>
                  <p className="text-primary-foreground/80 text-sm">Free consultation request</p>
                </div>
                <CardContent className="p-6">
                  <BookingForm clinicId={clinic.id} />
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-border/50 shadow-sm rounded-3xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold mb-2">Contact Details</h3>
                  {clinic.phone && (
                    <a href={`tel:${clinic.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <Phone className="h-4 w-4" />
                      </div>
                      {clinic.phone}
                    </a>
                  )}
                  {clinic.email && (
                    <a href={`mailto:${clinic.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="truncate">{clinic.email}</span>
                    </a>
                  )}
                  {clinic.website && (
                    <a href={clinic.website} target="_blank" rel="noopener" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="truncate">Visit Website</span>
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              {clinic.latitude && clinic.longitude && googleMapsApiKey && (
                <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden">
                  <div className="h-64 bg-muted">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${clinic.latitude},${clinic.longitude}`}
                    ></iframe>
                  </div>
                </Card>
              )}

              {/* Compare Button */}
              <Button
                onClick={async () => {
                  await addToComparison(clinic.id);
                }}
                variant="outline"
                className="w-full h-12 rounded-xl border-dashed"
                disabled={comparisonList.length >= 3 || comparisonList.some((c) => c.id === clinic.id)}
              >
                <div className="flex items-center gap-2">
                  <FavoriteButton clinicId={clinic.id} className="mr-2" />
                  {comparisonList.some((c) => c.id === clinic.id) ? "Added to Comparison" : "Add to Comparison"}
                </div>
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
