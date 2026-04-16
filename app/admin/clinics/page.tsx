"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Building2 } from "lucide-react"
import Link from "next/link"

interface Clinic {
  id: string
  name: string
  slug: string
  address: string
  city: string
  _count: {
    reviews: number
    bookings: number
  }
}

export default function AdminClinicsPage() {
  const { data, isLoading, isError } = useQuery<{ clinics: Clinic[] }>({
    queryKey: ["admin-clinics"],
    queryFn: async () => {
      const response = await api.get<{ clinics: Clinic[] }>(
        "/clinics?limit=1000"
      )
      return response
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading clinics...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load clinics</p>
        </div>
      </div>
    )
  }

  const clinics = data?.clinics || []

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clinics</h1>
        <Button asChild>
          <Link href="/admin/clinics/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Clinic
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState
                      icon={
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      }
                      title="No clinics found"
                      description="Get started by creating your first clinic."
                      action={{
                        label: "Add New Clinic",
                        href: "/admin/clinics/new",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                clinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell>
                      <div className="font-medium">{clinic.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {clinic.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{clinic.city}</Badge>
                    </TableCell>
                    <TableCell>{clinic._count.reviews}</TableCell>
                    <TableCell>{clinic._count.bookings}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/clinics/${clinic.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/clinics/${clinic.slug}`}
                            target="_blank"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
