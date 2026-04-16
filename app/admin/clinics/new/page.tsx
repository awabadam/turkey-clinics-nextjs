"use client"

import ClinicForm from "@/components/admin/ClinicForm"

export default function NewClinicPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Add New Clinic</h1>
      <ClinicForm />
    </div>
  )
}
