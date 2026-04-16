"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Scale } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { Clinic } from "@/hooks/use-clinics"

const COMPARISON_STORAGE_KEY = "clinic_comparison"

export function ComparisonTool() {
  const router = useRouter()
  const { toast } = useToast()
  const [comparisonList, setComparisonList] = useState<Clinic[]>([])

  useEffect(() => {
    loadComparison()
  }, [])

  const loadComparison = async () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COMPARISON_STORAGE_KEY)
      if (stored) {
        try {
          const clinicIds = JSON.parse(stored)
          if (Array.isArray(clinicIds) && clinicIds.length > 0) {
            const clinicPromises = clinicIds.map((id: string) =>
              api.get<Clinic>(`/clinics/${id}`).catch(() => null)
            )
            const clinics = await Promise.all(clinicPromises)
            setComparisonList(clinics.filter((c): c is Clinic => c !== null))
          }
        } catch (e) {
          localStorage.removeItem(COMPARISON_STORAGE_KEY)
        }
      }
    }
  }

  const saveComparison = (clinics: Clinic[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(clinics.map((c) => c.id)))
      setComparisonList(clinics)
    }
  }

  const removeFromComparison = (clinicId: string) => {
    const updated = comparisonList.filter((c) => c.id !== clinicId)
    saveComparison(updated)
    toast({
      title: "Removed from comparison",
      description: "The clinic has been removed from your comparison.",
    })
  }

  const clearComparison = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(COMPARISON_STORAGE_KEY)
    }
    setComparisonList([])
    toast({
      title: "Comparison cleared",
      description: "All clinics have been removed from comparison.",
    })
  }

  if (comparisonList.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border shadow-lg">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Comparison ({comparisonList.length}/3)
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearComparison}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {comparisonList.map((clinic) => (
            <div
              key={clinic.id}
              className="flex items-center justify-between p-2 bg-muted rounded"
            >
              <Link
                href={`/clinics/${clinic.slug}`}
                className="flex-1 hover:underline"
              >
                <p className="text-sm font-medium line-clamp-1">{clinic.name}</p>
                <p className="text-xs text-muted-foreground">{clinic.city}</p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => removeFromComparison(clinic.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {comparisonList.length >= 2 && (
            <Button
              className="w-full mt-2"
              onClick={() => router.push("/compare")}
            >
              Compare Now
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function useComparison() {
  const { toast } = useToast()
  const [comparisonList, setComparisonList] = useState<Clinic[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COMPARISON_STORAGE_KEY)
      if (stored) {
        try {
          const clinicIds = JSON.parse(stored)
          if (Array.isArray(clinicIds) && clinicIds.length > 0) {
            const fetchClinics = async () => {
              const clinicPromises = clinicIds.map((id: string) =>
                api.get<Clinic>(`/clinics/${id}`).catch(() => null)
              )
              const clinics = await Promise.all(clinicPromises)
              setComparisonList(clinics.filter((c): c is Clinic => c !== null))
            }
            fetchClinics()
          }
        } catch (e) {
          localStorage.removeItem(COMPARISON_STORAGE_KEY)
        }
      }
    }
  }, [])

  const addToComparison = async (clinicId: string): Promise<boolean> => {
    if (typeof window === "undefined") return false

    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY)
    const currentIds: string[] = stored ? JSON.parse(stored) : []

    if (currentIds.includes(clinicId)) {
      toast({
        title: "Already in comparison",
        description: "This clinic is already in your comparison list.",
      })
      return false
    }

    if (currentIds.length >= 3) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare a maximum of 3 clinics.",
        variant: "destructive",
      })
      return false
    }

    try {
      const clinic = await api.get<Clinic>(`/clinics/${clinicId}`)
      currentIds.push(clinicId)
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(currentIds))
      setComparisonList((prev) => [...prev, clinic])
      toast({
        title: "Added to comparison",
        description: `${clinic.name} has been added to your comparison.`,
      })
      return true
    } catch (error: any) {
      toast({
        title: "Error adding to comparison",
        description: error.message || "Could not fetch clinic details.",
        variant: "destructive",
      })
      return false
    }
  }

  const removeFromComparison = (clinicId: string) => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY)
    const currentIds: string[] = stored ? JSON.parse(stored) : []

    const updatedIds = currentIds.filter((id) => id !== clinicId)
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updatedIds))
    setComparisonList((prev) => prev.filter((c) => c.id !== clinicId))
    toast({
      title: "Removed from comparison",
      description: "The clinic has been removed from your comparison.",
    })
  }

  return { comparisonList, addToComparison, removeFromComparison }
}
