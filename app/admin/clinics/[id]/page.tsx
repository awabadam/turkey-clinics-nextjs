import { EditClinicClient } from "./edit-clinic"

export default async function EditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditClinicClient id={id} />
}
