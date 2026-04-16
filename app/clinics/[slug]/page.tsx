import { ClinicDetailClient } from "./clinic-detail"

export default async function ClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ClinicDetailClient slug={slug} />
}
