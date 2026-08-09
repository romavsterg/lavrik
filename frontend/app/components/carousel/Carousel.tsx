import { useLayoutEffect, useMemo, useRef, useState } from 'react';

const IMG_COUNT = 9;
const images = Array.from({ length: IMG_COUNT }, (_, i) => i + 1);
const GAP = 8;

const Carousel = () => {
  const [current, setCurrent] = useState(IMG_COUNT);
  const [isAnimating, setIsAnimating] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [measureVersion, setMeasureVersion] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  const trackImages = useMemo(() => [...images, ...images, ...images], []);

  const prev = () => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setCurrent(prevIndex => prevIndex - 1);
  };

  const next = () => {
    if (isAnimating) {
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

  return (
    <div className="relative w-full overflow-hidden" ref={viewportRef}>
      <div
        className={`flex items-center ${isAnimating ? 'transition-transform duration-500 ease-in-out' : ''}`}
        style={{ transform: `translateX(${translateX}px)`, gap: `${GAP}px` }}
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
              className="h-[453px] w-auto max-w-none object-contain"
              onLoad={() => setMeasureVersion(version => version + 1)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black px-3 py-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black px-3 py-2 rounded-full"
      >
        ›
      </button>
    </div>
  );
};

export default Carousel;
