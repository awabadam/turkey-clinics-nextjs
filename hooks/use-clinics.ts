import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Clinic {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  phone: string
  email?: string
  website?: string
  latitude?: number
  longitude?: number
  services: string[]
  languages: string[]
  certifications: string[]
  accreditations: string[]
  doctorCount?: number
  establishedYear?: number
  images: string[]
  beforeAfterImages: string[]
  trustBadges: string[]
  successStories: string[]
  testimonials?: unknown
  featured: boolean
  averageRating?: number
  createdAt: string
  updatedAt: string
  _count?: {
    reviews: number
  }
}

export interface ClinicsResponse {
  clinics: Clinic[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ClinicFilters {
  city?: string
  search?: string
  services?: string[]
  languages?: string[]
  minRating?: string
  sortBy?: string
  page?: number
  limit?: number
}

export function useClinics(filters: ClinicFilters = {}) {
  const params = new URLSearchParams()

  if (filters.city && filters.city !== "all") params.set("city", filters.city)
  if (filters.search) params.set("search", filters.search)
  if (filters.services && filters.services.length > 0) {
    params.set("services", filters.services.join(","))
  }
  if (filters.languages && filters.languages.length > 0) {
    params.set("languages", filters.languages.join(","))
  }
  if (filters.minRating && filters.minRating !== "all") {
    params.set("minRating", filters.minRating)
  }
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.page) params.set("page", filters.page.toString())
  if (filters.limit) params.set("limit", filters.limit.toString())

  return useQuery<ClinicsResponse>({
    queryKey: ["clinics", filters],
    queryFn: () =>
      api.get<ClinicsResponse>(`/clinics?${params.toString()}`),
  })
}

export function useClinic(slug: string) {
  return useQuery<Clinic>({
    queryKey: ["clinic", slug],
    queryFn: () => api.get<Clinic>(`/clinics/slug/${slug}`),
    enabled: !!slug,
  })
}
