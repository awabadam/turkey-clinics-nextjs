import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  clinicId: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function FavoriteButton({
  clinicId,
  size = "icon",
  variant = "ghost",
  className,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, clinicId]);

  const checkFavoriteStatus = async () => {
    try {
      const data = await api.get<{ isFavorite: boolean }>(`/favorites?clinicId=${clinicId}`);
      setIsFavorite(data.isFavorite);
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  };

  const handleToggle = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      navigate({ to: "/login" });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites?clinicId=${clinicId}`);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "This clinic has been removed from your favorites.",
        });
      } else {
        await api.post("/favorites", { clinicId });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "This clinic has been added to your favorites.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(isFavorite ? "text-red-500 hover:text-red-600" : "", className)}
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
      />
    </Button>
  );
}
