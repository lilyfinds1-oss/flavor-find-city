import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
  restaurantName: string;
}

export function PhotoGallery({ photos, restaurantName }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const next = () => setCurrentIndex((i) => (i + 1) % photos.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);

  return (
    <div>
      <h2 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        Photos ({photos.length})
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.slice(0, 8).map((photo, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden border border-border group",
              i === 0 && "col-span-2 row-span-2"
            )}
          >
            <img
              src={photo}
              alt={`${restaurantName} photo ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {i === 7 && photos.length > 8 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">+{photos.length - 8}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/10 z-10"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/10 z-10"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          <img
            src={photos[currentIndex]}
            alt={`${restaurantName} photo ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 text-white/70 text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
