import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
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
import { Link } from '@tanstack/react-router'
import { ProcedureManagement } from "@/components/admin/ProcedureManagement"

interface Procedure {
  id: string
  name: string
  description: string | null
  averagePrice: number | null
  clinicId: string
  clinic: {
    id: string
    name: string
    slug: string
  }
}

interface Clinic {
  id: string
  name: string
}

export const Route = createFileRoute('/admin/procedures')({
  component: AdminProceduresPage,
})

function AdminProceduresPage() {
  const { data: procedures, isLoading } = useQuery<Procedure[]>({
    queryKey: ['admin-procedures'],
    queryFn: async () => {
      const response = await api.get<Procedure[]>('/procedures')
      return response
    },
  })

  const { data: clinics } = useQuery<{ clinics: Clinic[] }>({
    queryKey: ['admin-clinics-list'],
    queryFn: async () => {
      const response = await api.get<{ clinics: Clinic[] }>('/clinics?limit=1000')
      return response
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading procedures...</p>
        </div>
      </div>
    )
  }

  const proceduresList = procedures || []
  const clinicsList = clinics?.clinics || []

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Procedures</h1>
        <ProcedureManagement clinics={clinicsList} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedure Name</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proceduresList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No procedures found. Add your first procedure above.
                  </TableCell>
                </TableRow>
              ) : (
                proceduresList.map((procedure) => (
                  <TableRow key={procedure.id}>
                    <TableCell className="font-medium">{procedure.name}</TableCell>
                    <TableCell>
                      <Link
                        to="/admin/clinics/$id"
                        params={{ id: procedure.clinic.id }}
                        className="text-primary hover:underline"
                      >
                        {procedure.clinic.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {procedure.averagePrice ? (
                        <Badge variant="secondary">
                          ${procedure.averagePrice.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ProcedureManagement
                          clinics={clinicsList}
                          procedure={procedure}
                        />
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
