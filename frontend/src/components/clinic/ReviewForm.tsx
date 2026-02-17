import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, AlertCircle, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createReviewSchema, CreateReviewInput } from "@/schemas/review";

interface ReviewFormProps {
  clinicId: string;
}

export default function ReviewForm({ clinicId }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      reviewCategories: {
        cleanliness: 5,
        staff: 5,
        results: 5,
        value: 5,
      },
      reviewImages: [],
    },
  });

  const rating = watch("rating");
  const categoryRatings = watch("reviewCategories");
  const reviewImages = watch("reviewImages") || [];

  if (!user) {
    return (
      <Alert>
        <LogIn className="h-4 w-4" />
        <AlertDescription>
          Please log in to write a review.
        </AlertDescription>
      </Alert>
    );
  }

  const onSubmit = async (data: CreateReviewInput) => {
    try {
      await api.post("/reviews", {
        ...data,
        clinicId,
      });

      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback.",
      });
      reset();
      setImageUrl("");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to submit review";
      setError("root", { message: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Overall Rating *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating.message}</p>
        )}
      </div>

      {categoryRatings && (
        <div className="space-y-4">
          <Label>Category Ratings</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(categoryRatings) as Array<keyof typeof categoryRatings>).map((category) => (
              <div key={category} className="space-y-2">
                <Label className="capitalize">{category}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setValue(`reviewCategories.${category}`, star, { shouldValidate: true })
                      }
                      className="focus:outline-none transition-transform hover:scale-110"
                      aria-label={`Rate ${category} ${star} stars`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (categoryRatings[category] || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          rows={4}
          placeholder="Tell others about your experience..."
          {...register("comment")}
        />
        {errors.comment && (
          <p className="text-sm text-destructive">{errors.comment.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Add Review Photo (Image URL)</Label>
        <div className="flex gap-2">
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (imageUrl.trim()) {
                setValue("reviewImages", [...reviewImages, imageUrl.trim()]);
                setImageUrl("");
              }
            }}
          >
            Add
          </Button>
        </div>
        {reviewImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {reviewImages.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Review photo ${index + 1}`}
                  className="h-20 w-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "reviewImages",
                      reviewImages.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
