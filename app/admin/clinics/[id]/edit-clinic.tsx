"use client"

import { useQuery } from "@tanstack/react-query"
import ClinicForm from "@/components/admin/ClinicForm"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface EditClinicClientProps {
  id: string
}

export function EditClinicClient({ id }: EditClinicClientProps) {
  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ["clinic", id],
    queryFn: async () => {
      const response = await api.get(`/clinics/${id}`)
      return response
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !clinic) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Edit Clinic</h1>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load clinic. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Edit Clinic</h1>
      <ClinicForm clinic={clinic} />
    </div>
  )
}
