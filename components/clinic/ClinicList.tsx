"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Building2 } from "lucide-react"
import { ClinicCard } from "@/components/luxury/ClinicCard"

interface Clinic {
  id: string
  name: string
  slug: string
  address: string
  city: string
  images: string[]
  languages?: string[]
  averageRating?: number
  procedures?: Array<{
    averagePrice: number | null
  }>
  featured?: boolean
  _count?: {
    reviews: number
  }
}

export default function ClinicList() {
  const searchParams = useSearchParams()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })

  useEffect(() => {
    async function fetchClinics() {
      setLoading(true)
      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        params.append(key, value)
      })

      const queryString = params.toString()
      const response = await fetch(`/api/clinics?${queryString}`)
      const data = await response.json()

      if (data.clinics) {
        setClinics(data.clinics)
        setPagination(data.pagination)
      }
      setLoading(false)
    }

    fetchClinics()
  }, [searchParams])

  if (loading) {
    return (
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-3xl overflow-hidden border-none shadow-none bg-muted/20">
              <Skeleton className="aspect-[4/3] w-full rounded-b-none" />
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (clinics.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          title="No clinics found"
          description="Try adjusting your search filters or check back later for new clinics."
        />
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clinics.map((clinic, index) => (
          <ClinicCard key={clinic.id} clinic={clinic} index={index} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-16 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => {
              const params = new URLSearchParams()
              searchParams.forEach((value, key) => {
                params.set(key, value)
              })
              params.set("page", page.toString())

              return (
                <Button
                  key={page}
                  asChild
                  variant={pagination.page === page ? "default" : "outline"}
                  size="icon"
                  className="w-10 h-10 rounded-full"
                >
                  <Link href={`/?${params.toString()}`}>
                    {page}
                  </Link>
                </Button>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}
