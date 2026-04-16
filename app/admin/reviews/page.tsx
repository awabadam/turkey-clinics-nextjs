"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Star, MessageSquare, Eye } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import Link from "next/link"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  clinic: {
    id: string
    name: string
    slug: string
  }
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const response = await api.get<Review[]>("/reviews")
      return response
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return api.delete(`/reviews/${reviewId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
      toast({
        title: "Review deleted",
        description: "The review has been removed.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reviews Management</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and moderate clinic reviews
          </p>
        </div>
        <Badge variant="secondary">
          {reviews?.length || 0} total reviews
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {!reviews || reviews.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<MessageSquare className="h-12 w-12 text-muted-foreground" />}
                title="No reviews yet"
                description="Reviews from users will appear here"
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {review.user.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clinics/${review.clinic.slug}`}
                        className="text-primary hover:underline"
                      >
                        {review.clinic.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Details</DialogTitle>
                            <DialogDescription>
                              Review by {review.user.name || review.user.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium mb-1">Clinic</div>
                              <div className="text-sm text-muted-foreground">
                                {review.clinic.name}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Rating</div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{review.rating} / 5</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Comment</div>
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {review.comment || "No comment provided"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Date</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={deleteDialogOpen && reviewToDelete === review.id} onOpenChange={(open) => {
                        setDeleteDialogOpen(open)
                        if (!open) setReviewToDelete(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setReviewToDelete(review.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Review</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this review? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2 justify-end mt-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDeleteDialogOpen(false)
                                setReviewToDelete(null)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                deleteReviewMutation.mutate(review.id)
                                setDeleteDialogOpen(false)
                                setReviewToDelete(null)
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
