import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createBookingSchema, CreateBookingInput } from "@/schemas/booking";

interface BookingFormProps {
  clinicId: string;
}

export default function BookingForm({ clinicId }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      message: "",
    },
  });

  // Update form defaults when user loads
  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const onSubmit = async (data: CreateBookingInput) => {
    try {
      await api.post("/bookings", {
        ...data,
        clinicId,
      });

      toast({
        title: "Booking submitted successfully!",
        description: "The clinic will contact you soon.",
      });
      reset();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to submit booking";
      setError("root", { message: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Your full name"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          {...register("phone")}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDate">Preferred Date</Label>
        <Input
          id="preferredDate"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          {...register("preferredDate")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Any additional information or preferred date/time..."
          rows={4}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
