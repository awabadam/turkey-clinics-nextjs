"use client"

import { useClinic } from "@/hooks/use-clinics"
import { ClinicDetail } from "@/components/clinic/ClinicDetail"
import { Skeleton } from "@/components/ui/skeleton"

interface ClinicDetailClientProps {
  slug: string
}

export function ClinicDetailClient({ slug }: ClinicDetailClientProps) {
  const { data: clinic, isLoading, error } = useClinic(slug)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !clinic) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Clinic not found</h1>
          <p className="text-muted-foreground">The clinic you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return <ClinicDetail clinic={clinic as any} />
}
