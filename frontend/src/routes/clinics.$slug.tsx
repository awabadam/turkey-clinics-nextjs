import { createFileRoute } from '@tanstack/react-router'
import { useClinic } from '../hooks/useClinics'
import { ClinicDetail } from '../components/clinic/ClinicDetail'
import { Skeleton } from '../components/ui/skeleton'
import { Helmet } from 'react-helmet-async'

export const Route = createFileRoute('/clinics/$slug')({
  component: ClinicDetailPage,
})

function ClinicDetailPage() {
  const { slug } = Route.useParams()
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
        <Helmet>
          <title>Clinic Not Found | Turkey Clinic Guide</title>
        </Helmet>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Clinic not found</h1>
          <p className="text-muted-foreground">The clinic you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{clinic.name} | Turkey Clinic Guide</title>
        <meta name="description" content={`Book an appointment at ${clinic.name} in ${clinic.city}. ${clinic.description?.substring(0, 150) || 'Find the best dental care in Turkey.'}...`} />
      </Helmet>
      <ClinicDetail clinic={clinic as any} />
    </>
  )
}
