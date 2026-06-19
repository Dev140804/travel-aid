"use client";

import { useEffect, useState, type TouchEvent } from "react";

type PlacePhotoGalleryProps = {
  images: string[];
  altPrefix: string;
};

const normalizeUrl = (url: string) => {
  try {
    const normalizedUrl = new URL(url);
    normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/\/+$/, '');
    // keep query params; that is often enough for image uniqueness
    return normalizedUrl.toString();
  } catch {
    return url.trim().replace(/\/\/+$/, '');
  }
};

export default function PlacePhotoGallery({ images, altPrefix }: PlacePhotoGalleryProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    if (isLightboxOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isLightboxOpen]);

  useEffect(() => {
    const deduped: string[] = [];
    images.forEach((img) => {
      const trimmed = img?.trim();
    if (!trimmed) return;
    const normalized = normalizeUrl(trimmed);
    if (!deduped.some((existing) => normalizeUrl(existing) === normalized)) {
      deduped.push(trimmed);
    }
    });

    if (deduped.length > 1 && normalizeUrl(deduped[0]) === normalizeUrl(deduped[1])) {
      const nextDifferentIndex = deduped.findIndex((img, i) => i > 1 && normalizeUrl(img) !== normalizeUrl(deduped[0]));
      if (nextDifferentIndex > 1) {
        const temp = deduped[1];
        deduped[1] = deduped[nextDifferentIndex];
        deduped[nextDifferentIndex] = temp;
      } else {
        // as a last resort, replace second with a place-related fallback URL to ensure uniqueness
        deduped[1] = `https://source.unsplash.com/900x1600/?${encodeURIComponent(altPrefix)},travel&sig=related-2`;
      }
    }

    const desiredCount = Math.min(images.length || 8, 8);

    if (deduped.length < desiredCount) {
      const extrasNeeded = desiredCount - deduped.length;
      for (let i = 0; i < extrasNeeded; i += 1) {
        deduped.push(`https://source.unsplash.com/900x1600/?${encodeURIComponent(altPrefix)},travel&sig=extra-${i}`);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSources(deduped.slice(0, desiredCount));
  }, [images, altPrefix]);

  const handleError = (index: number) => {
    setSources((prev) => {
      const next = [...prev];
      next[index] = `https://source.unsplash.com/900x1600/?${encodeURIComponent(altPrefix)},travel&sig=error-${index}`;
      return next;
    });
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoom(1);
    setTouchDistance(null);
    setTouchStartX(null);
  };

  const showPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const showNext = () => {
    setCurrentIndex((prev) => Math.min(sources.length - 1, prev + 1));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      setTouchDistance(Math.sqrt(dx * dx + dy * dy));
      return;
    }

    if (event.touches.length === 1) {
      setTouchStartX(event.touches[0].clientX);
    }
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2 && touchDistance !== null) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / touchDistance;

      setZoom((prevZoom) => {
        const next = Math.min(3, Math.max(1, prevZoom * ratio));
        return next;
      });
      setTouchDistance(dist);
      event.preventDefault();
    }
  };

  const getHighQualitySource = (src: string) => {
    const trimmed = src.trim();

    if (trimmed.startsWith('/api/photo?ref=')) {
      return trimmed; // google route already maxes to 1600
    }

    if (trimmed.includes('source.unsplash.com/featured')) {
      return trimmed.replace('source.unsplash.com/featured', 'source.unsplash.com/3840x2160');
    }

    if (trimmed.includes('source.unsplash.com/1200x800')) {
      return trimmed.replace('source.unsplash.com/1200x800', 'source.unsplash.com/3840x2160');
    }

    if (trimmed.includes('loremflickr.com/1200/800')) {
      return trimmed.replace('loremflickr.com/1200/800', 'loremflickr.com/3840/2160');
    }

    if (trimmed.includes('picsum.photos/seed/') && trimmed.includes('/1200/800')) {
      return trimmed.replace('/1200/800', '/3840/2160');
    }

    return trimmed;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchDistance !== null) {
      setTouchDistance(null);
      setTouchStartX(null);
      return;
    }

    if (touchStartX === null) return;

    const diff = event.changedTouches[0].clientX - touchStartX;
    if (diff < -40) {
      showNext();
    } else if (diff > 40) {
      showPrevious();
    }

    setTouchStartX(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {sources.map((src, idx) => (
          <div key={`${src}-${idx}`} className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl relative">
            <div className="w-full aspect-[9/16] overflow-hidden bg-black">
              {src === 'vacant' ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 bg-slate-800">
                  Vacant
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`${altPrefix} photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onError={() => handleError(idx)}
                  onClick={() => openLightbox(idx)}
                />
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-xs text-white text-center py-1">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {isLightboxOpen && sources[currentIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          onTouchStart={(event: TouchEvent<HTMLDivElement>) => handleTouchStart(event)}
          onTouchMove={(event: TouchEvent<HTMLDivElement>) => handleTouchMove(event)}
          onTouchEnd={(event: TouchEvent<HTMLDivElement>) => handleTouchEnd(event)}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-50 rounded-full bg-black/60 p-3 text-white hover:bg-black"
            aria-label="Close"
          >
            ✕
          </button>

          <button
            onClick={showPrevious}
            disabled={currentIndex === 0}
            className="absolute left-5 z-50 rounded-full bg-black/60 p-3 text-white hover:bg-black disabled:opacity-40"
            aria-label="Previous"
          >
            ⬅
          </button>

          <div className="relative w-full max-w-[36rem] aspect-[9/16] overflow-hidden rounded-xl bg-black border border-white/20">
            {sources[currentIndex] === 'vacant' ? (
              <div className="w-full h-full flex items-center justify-center text-xl font-medium text-slate-200 bg-slate-800">
                Vacant
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getHighQualitySource(sources[currentIndex])}
                srcSet={`${getHighQualitySource(sources[currentIndex])} 1x, ${getHighQualitySource(sources[currentIndex])} 2x`}
                alt={`${altPrefix} photo ${currentIndex + 1}`}
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.2s ease',
                  touchAction: 'none',
                  imageRendering: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  willChange: 'transform',
                }}
                onError={() => handleError(currentIndex)}
                onDoubleClick={() => setZoom(1)}
                onWheel={(event) => {
                  event.preventDefault();
                  const delta = -event.deltaY;
                  setZoom((prevZoom) => {
                    const next = prevZoom + (delta > 0 ? 0.18 : -0.18);
                    return Math.min(5, Math.max(1, next));
                  });
                }}
              />
            )}
            <div className="absolute bottom-2 inset-x-0 text-center text-white text-sm bg-black/40 py-1">
              {currentIndex + 1} / {sources.length}
            </div>
          </div>

          <button
            onClick={showNext}
            disabled={currentIndex === sources.length - 1}
            className="absolute right-5 z-50 rounded-full bg-black/60 p-3 text-white hover:bg-black disabled:opacity-40"
            aria-label="Next"
          >
            ➡
          </button>
        </div>
      )}
    </>
  );
}
