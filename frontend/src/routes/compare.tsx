import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ComparisonTable } from "@/components/clinic/ComparisonTable"
import { EmptyState } from "@/components/ui/empty-state"
import { Scale, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from '@/lib/api'

const COMPARISON_STORAGE_KEY = "clinic_comparison"

interface Clinic {
  id: string
  name: string
  slug: string
  address: string
  city: string
  images: string[]
  services: string[]
  languages?: string[]
  certifications?: string[]
  accreditations?: string[]
  establishedYear?: number
  doctorCount?: number
  averageRating?: number
  procedures?: Array<{
    name: string
    averagePrice: number | null
  }>
  _count?: {
    reviews: number
  }
}

export const Route = createFileRoute('/compare')({
  component: ComparePage,
})

function ComparePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComparison()
  }, [])

  const loadComparison = async () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COMPARISON_STORAGE_KEY)
      if (stored) {
        try {
          const clinicIds = JSON.parse(stored)
          if (Array.isArray(clinicIds) && clinicIds.length > 0) {
            // Fetch full clinic data
            const clinicPromises = clinicIds.map((id: string) =>
              api.get<Clinic>(`/clinics/${id}`)
            )
            const responses = await Promise.all(clinicPromises)
            const clinicData = responses.map(r => r).filter((c) => c && !(c as any).error)
            setClinics(clinicData as Clinic[])
          }
        } catch (e) {
          localStorage.removeItem(COMPARISON_STORAGE_KEY)
        }
      }
      setLoading(false)
    }
  }

  const removeClinic = (clinicId: string) => {
    const updated = clinics.filter((c) => c.id !== clinicId)
    setClinics(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem(
        COMPARISON_STORAGE_KEY,
        JSON.stringify(updated.map((c) => c.id))
      )
    }
    toast({
      title: "Removed from comparison",
      description: "The clinic has been removed from your comparison.",
    })
  }

  const clearComparison = () => {
    setClinics([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(COMPARISON_STORAGE_KEY)
    }
    toast({
      title: "Comparison cleared",
      description: "All clinics have been removed from comparison.",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading comparison...</p>
          </div>
        </div>
      </div>
    )
  }

  if (clinics.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            icon={<Scale className="h-12 w-12 text-muted-foreground" />}
            title="No clinics to compare"
            description="Add clinics to your comparison list to see them side-by-side. You can compare up to 3 clinics at a time."
            action={{
              label: "Browse Clinics",
              href: "/",
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Compare Clinics</h1>
            <p className="text-muted-foreground mt-2">
              Side-by-side comparison of {clinics.length} clinic{clinics.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={clearComparison}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {clinics.map((clinic) => (
              <Card key={clinic.id} className="min-w-[250px] flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-2">{clinic.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeClinic(clinic.id)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {clinic.city}
                  </p>
                  {clinic.images.length > 0 && (
                    <div className="h-32 bg-muted rounded overflow-hidden mb-2">
                      <img
                        src={clinic.images[0]}
                        alt={clinic.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate({ to: `/clinics/${clinic.slug}` })}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <ComparisonTable clinics={clinics} />
      </div>
    </div>
  )
}
