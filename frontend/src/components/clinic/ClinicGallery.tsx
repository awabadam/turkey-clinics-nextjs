import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ClinicGalleryProps {
  images: string[];
  title?: string;
}

export function ClinicGallery({ images, title }: ClinicGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div>
        {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.slice(0, 6).map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            >
              <img
                src={image}
                alt={`${title || "Clinic"} image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 5 && images.length > 6 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  +{images.length - 6} more
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl w-full p-0 bg-black/95">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative aspect-video">
              <img
                src={images[selectedIndex]}
                alt={`${title || "Clinic"} image ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>
            <div className="p-4 text-white text-center">
              <p className="text-sm">
                {selectedIndex + 1} of {images.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
