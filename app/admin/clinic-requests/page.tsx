"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Building2 } from "lucide-react"

interface PendingClinic {
  id: string
  name: string
  city: string
  phone: string
  email: string
  createdAt: string
  status: string
  owner: {
    email: string
    name: string
  }
}

export default function ClinicRequestsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: clinics, isLoading } = useQuery<PendingClinic[]>({
    queryKey: ["pending-clinics"],
    queryFn: async () => {
      return api.get("/clinics/admin/pending")
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/clinics/admin/${id}/approve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-clinics"] })
      toast({ title: "Clinic approved successfully" })
    },
    onError: (error: any) => {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/clinics/admin/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-clinics"] })
      toast({ title: "Clinic rejected" })
    },
    onError: (error: any) => {
      toast({ title: "Failed to reject", description: error.message, variant: "destructive" })
    },
  })

  if (isLoading) return <div className="p-8">Loading requests...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clinic Registration Requests</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {!clinics || clinics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending requests.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell>
                      <div className="font-medium">{clinic.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {clinic.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{clinic.owner?.name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{clinic.owner?.email}</div>
                    </TableCell>
                    <TableCell>{clinic.city}</TableCell>
                    <TableCell>{new Date(clinic.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => approveMutation.mutate(clinic.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => rejectMutation.mutate(clinic.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
