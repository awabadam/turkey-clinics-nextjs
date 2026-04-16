"use client"

import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

interface Procedure {
  id: string
  name: string
  description: string | null
  averagePrice: number | null
  clinicId: string
}

interface Clinic {
  id: string
  name: string
}

interface ProcedureManagementProps {
  clinics: Clinic[]
  procedure?: Procedure
}

export function ProcedureManagement({
  clinics,
  procedure,
}: ProcedureManagementProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: procedure?.name || "",
    description: procedure?.description || "",
    averagePrice: procedure?.averagePrice?.toString() || "",
    clinicId: procedure?.clinicId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        averagePrice: formData.averagePrice ? parseFloat(formData.averagePrice) : null,
      }

      if (procedure) {
        await api.put(`/procedures/${procedure.id}`, payload)
      } else {
        await api.post("/procedures", payload)
      }

      toast({
        title: procedure ? "Procedure updated!" : "Procedure created!",
        description: `The procedure has been ${procedure ? "updated" : "created"} successfully.`,
      })
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-procedures'] })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save procedure",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!procedure || !confirm("Are you sure you want to delete this procedure?")) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/procedures/${procedure.id}`)

      toast({
        title: "Procedure deleted",
        description: "The procedure has been deleted successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['admin-procedures'] })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete procedure",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {procedure ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Procedure
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {procedure ? "Edit Procedure" : "Add New Procedure"}
          </DialogTitle>
          <DialogDescription>
            {procedure
              ? "Update procedure information"
              : "Add a new procedure with pricing"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicId">Clinic *</Label>
            <Select
              value={formData.clinicId}
              onValueChange={(value) =>
                setFormData({ ...formData, clinicId: value })
              }
              disabled={!!procedure}
            >
              <SelectTrigger id="clinicId">
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Procedure Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Dental Implant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Procedure description..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="averagePrice">Average Price (USD)</Label>
            <Input
              id="averagePrice"
              type="number"
              step="0.01"
              value={formData.averagePrice}
              onChange={(e) =>
                setFormData({ ...formData, averagePrice: e.target.value })
              }
              placeholder="1000.00"
            />
          </div>

          <div className="flex justify-end gap-4">
            {procedure && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : procedure ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
