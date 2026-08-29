import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const IMG_COUNT = 9;
const images = Array.from({ length: IMG_COUNT }, (_, i) => i + 1);
const GAP = 8;
const SWIPE_THRESHOLD = 50;
const WHEEL_COOLDOWN = 350;

const Carousel = () => {
  const [current, setCurrent] = useState(IMG_COUNT);
  const [isAnimating, setIsAnimating] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [measureVersion, setMeasureVersion] = useState(0);
  const [loadedSlidesCount, setLoadedSlidesCount] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const loadedSlidesRef = useRef<boolean[]>([]);
  const dragStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wheelLockRef = useRef(false);
  const wheelTimeoutRef = useRef<number | null>(null);

  const trackImages = useMemo(() => [...images, ...images, ...images], []);
  const isTrackLoaded = loadedSlidesCount === trackImages.length;

  const handleSlideLoaded = (index: number) => {
    if (!loadedSlidesRef.current[index]) {
      loadedSlidesRef.current[index] = true;
      setLoadedSlidesCount(count => count + 1);
    }

    setMeasureVersion(version => version + 1);
  };

  const prev = () => {
    if (isAnimating || isDraggingRef.current) {
      return;
    }

    setIsAnimating(true);
    setCurrent(prevIndex => prevIndex - 1);
  };

  const next = () => {
    if (isAnimating || isDraggingRef.current) {
      return;
    }

    setIsAnimating(true);
    setCurrent(prevIndex => prevIndex + 1);
  };

  useLayoutEffect(() => {
    const updateTranslate = () => {
      const viewport = viewportRef.current;
      const activeSlide = slideRefs.current[current];

      if (!viewport || !activeSlide) {
        return;
      }

      const viewportWidth = viewport.clientWidth;
      const slideCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;
      setTranslateX(viewportWidth / 2 - slideCenter);
    };

    updateTranslate();
    window.addEventListener('resize', updateTranslate);

    return () => {
      window.removeEventListener('resize', updateTranslate);
    };
  }, [current, measureVersion]);

  const handleTransitionEnd = () => {
    setIsAnimating(false);

    if (current >= IMG_COUNT * 2) {
      setCurrent(current - IMG_COUNT);
      return;
    }

    if (current < IMG_COUNT) {
      setCurrent(current + IMG_COUNT);
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (wheelLockRef.current || isAnimating || isDraggingRef.current) {
        return;
      }

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 10) {
        return;
      }

      wheelLockRef.current = true;
      if (wheelTimeoutRef.current) {
        window.clearTimeout(wheelTimeoutRef.current);
      }

      wheelTimeoutRef.current = window.setTimeout(() => {
        wheelLockRef.current = false;
      }, WHEEL_COOLDOWN);

      setIsAnimating(true);
      setCurrent((prevIndex) => prevIndex + (delta > 0 ? 1 : -1));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) {
        window.clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [isAnimating]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    if (isAnimating) {
      return;
    }

    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    setDragOffset(event.clientX - dragStartXRef.current);
  };

  const handlePointerEnd = () => {
    if (!isDraggingRef.current) {
      return;
    }

    const offset = dragOffset;
    isDraggingRef.current = false;
    setDragOffset(0);

    const swipeThreshold = Math.max(24, Math.min(SWIPE_THRESHOLD, (viewportRef.current?.clientWidth ?? 0) * 0.08));

    if (Math.abs(offset) < swipeThreshold) {
      return;
    }

    if (offset < 0) {
      next();
      return;
    }

    prev();
  };

  return (
    <div
      className="relative w-full overflow-hidden overscroll-none cursor-grab active:cursor-grabbing select-none touch-pan-y"
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      <div
        className={`flex items-center ${isAnimating ? 'transition-transform duration-500 ease-in-out' : ''}`}
        style={{ transform: `translateX(${translateX + dragOffset}px)`, gap: `${GAP}px` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {trackImages.map((num, idx) => (
          <div
            key={`${num}-${idx}`}
            className={`flex-shrink-0 ${current === idx ? 'opacity-100' : 'opacity-75'}`}
            ref={(element) => {
              slideRefs.current[idx] = element;
            }}
          >
            <img
              src={`mainCarousel/${num}.jpg`}
              alt={`Слайд ${num}`}
              className="h-[calc(74vh-50px)] sm:h-[453px] w-auto max-w-none object-contain"
              draggable={false}
              onLoad={() => handleSlideLoaded(idx)}
              onError={() => handleSlideLoaded(idx)}
            />
          </div>
        ))}
      </div>

      <div
        className={`absolute inset-0 z-10 bg-gray-200 pointer-events-none transition-opacity duration-500 ${isTrackLoaded ? 'opacity-0' : 'opacity-100'}`}
      />

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-white text-black border border-black/30 shadow-md px-2.5 sm:px-3 py-2 sm:py-2 rounded-full text-xl sm:text-2xl"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-white text-black border border-black/30 shadow-md px-2.5 sm:px-3 py-2 sm:py-2 rounded-full text-xl sm:text-2xl"
      >
        ›
      </button>
    </div>
  );
};

export default Carousel;
