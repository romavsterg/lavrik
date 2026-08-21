import { useEffect, useRef, useState } from 'react';

const SWIPE_THRESHOLD = 50;
const SWIPE_THRESHOLD_MIN = 24;
const WHEEL_SWITCH_DISTANCE = 70;
const DRAG_PREVIEW_DISTANCE = 220;
const DRAG_PREVIEW_DISTANCE_MIN = 80;
const WHEEL_GESTURE_END_DELAY = 120;
const WHEEL_LINE_STEP_INTERVAL = 55;
const WHEEL_PIXEL_MIN_DELTA = 2;
const WHEEL_STREAM_UNLOCK_IDLE = 90;

type ProjectImageModalProps = {
  imageUrl: string;
  prevImageUrl: string;
  nextImageUrl: string;
  imageName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hideImgName: boolean;
};

export default function ProjectImageModal({ imageUrl, prevImageUrl, nextImageUrl, imageName, onClose, onPrev, onNext, hideImgName }: ProjectImageModalProps) {
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [wheelPreviewDirection, setWheelPreviewDirection] = useState<'prev' | 'next' | null>(null);
  const [wheelPreviewProgress, setWheelPreviewProgress] = useState(0);
  const [currentImageWidth, setCurrentImageWidth] = useState(0);
  const [previewImageWidth, setPreviewImageWidth] = useState(0);
  const [stageWidth, setStageWidth] = useState(0);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const currentImageRef = useRef<HTMLImageElement | null>(null);
  const previewImageRef = useRef<HTMLImageElement | null>(null);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const wheelGestureTimeoutRef = useRef<number | null>(null);
  const wheelStreamUnlockTimeoutRef = useRef<number | null>(null);
  const wheelDistanceRef = useRef(0);
  const wheelDirectionRef = useRef<'prev' | 'next' | null>(null);
  const lastWheelTriggerAtRef = useRef(0);
  const wheelStreamLockedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsBackgroundVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    setWheelPreviewDirection(null);
    setWheelPreviewProgress(0);
    setDragOffset(0);
  }, [imageUrl]);

  useEffect(() => {
    const updateWidths = () => {
      const currentWidth = currentImageRef.current?.getBoundingClientRect().width ?? 0;
      const nextWidth = previewImageRef.current?.getBoundingClientRect().width ?? 0;
      const nextStageWidth = stageRef.current?.getBoundingClientRect().width ?? 0;

      setCurrentImageWidth(currentWidth);
      setPreviewImageWidth(nextWidth);
      setStageWidth(nextStageWidth);
    };

    updateWidths();
    window.addEventListener('resize', updateWidths);

    return () => {
      window.removeEventListener('resize', updateWidths);
    };
  }, [imageUrl, prevImageUrl, nextImageUrl]);

  useEffect(() => {
    onPrevRef.current = onPrev;
    onNextRef.current = onNext;
  }, [onPrev, onNext]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (isDraggingRef.current) {
        return;
      }

      const resetGestureState = () => {
        wheelDistanceRef.current = 0;
        wheelDirectionRef.current = null;
        setWheelPreviewDirection(null);
        setWheelPreviewProgress(0);
      };

      const scheduleStreamUnlock = () => {
        if (wheelStreamUnlockTimeoutRef.current) {
          window.clearTimeout(wheelStreamUnlockTimeoutRef.current);
        }

        wheelStreamUnlockTimeoutRef.current = window.setTimeout(() => {
          wheelStreamLockedRef.current = false;
        }, WHEEL_STREAM_UNLOCK_IDLE);
      };

      const scheduleReset = (delay: number) => {
        if (wheelGestureTimeoutRef.current) {
          window.clearTimeout(wheelGestureTimeoutRef.current);
        }

        wheelGestureTimeoutRef.current = window.setTimeout(() => {
          resetGestureState();
        }, delay);
      };

      const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const delta = dominantDelta * deltaScale;
      const now = Date.now();

      const deltaAbs = Math.abs(delta);

      if (deltaAbs < WHEEL_PIXEL_MIN_DELTA) {
        return;
      }

      const direction: 'prev' | 'next' = delta > 0 ? 'next' : 'prev';

      if (wheelStreamLockedRef.current) {
        scheduleStreamUnlock();
        return;
      }

      if (event.deltaMode === 1) {
        if (now - lastWheelTriggerAtRef.current < WHEEL_LINE_STEP_INTERVAL) {
          return;
        }

        lastWheelTriggerAtRef.current = now;
        wheelStreamLockedRef.current = true;
        scheduleStreamUnlock();
        setWheelPreviewDirection(direction);
        setWheelPreviewProgress(1);
        scheduleReset(WHEEL_LINE_STEP_INTERVAL);

        if (direction === 'next') {
          onNextRef.current();
          return;
        }

        onPrevRef.current();
        return;
      }

      if (wheelDirectionRef.current && wheelDirectionRef.current !== direction) {
        wheelDistanceRef.current = 0;
      }

      wheelDirectionRef.current = direction;

      wheelDistanceRef.current += deltaAbs;

      const progress = Math.min(wheelDistanceRef.current / WHEEL_SWITCH_DISTANCE, 1);
      setWheelPreviewDirection(direction);
      setWheelPreviewProgress(progress);

      if (progress >= 1) {
        lastWheelTriggerAtRef.current = now;
        wheelStreamLockedRef.current = true;
        scheduleStreamUnlock();
        wheelDistanceRef.current = 0;
        wheelDirectionRef.current = null;
        setWheelPreviewDirection(null);
        setWheelPreviewProgress(0);

        if (direction === 'next') {
          onNextRef.current();
        } else {
          onPrevRef.current();
        }

        return;
      }

      scheduleReset(WHEEL_GESTURE_END_DELAY);
    };

    modal.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      modal.removeEventListener('wheel', handleWheel);
      if (wheelGestureTimeoutRef.current) {
        window.clearTimeout(wheelGestureTimeoutRef.current);
      }
      if (wheelStreamUnlockTimeoutRef.current) {
        window.clearTimeout(wheelStreamUnlockTimeoutRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
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
    const swipeThreshold = Math.max(SWIPE_THRESHOLD_MIN, Math.min(SWIPE_THRESHOLD, stageWidth * 0.08));

    if (Math.abs(offset) < swipeThreshold) {
      return;
    }

    if (offset < 0) {
      onNextRef.current();
      return;
    }

    onPrevRef.current();
  };

  const dragDirection = dragOffset < 0 ? 'next' : dragOffset > 0 ? 'prev' : null;
  const dragPreviewDistance = Math.max(DRAG_PREVIEW_DISTANCE_MIN, Math.min(DRAG_PREVIEW_DISTANCE, stageWidth * 0.35));
  const dragProgress = Math.min(Math.abs(dragOffset) / dragPreviewDistance, 1);

  const previewDirection = dragDirection ?? wheelPreviewDirection;
  const previewProgress = dragDirection ? dragProgress : wheelPreviewProgress;
  const previewImageUrl = previewDirection === 'next' ? nextImageUrl : previewDirection === 'prev' ? prevImageUrl : null;
  const slideDistance = Math.max(currentImageWidth, previewImageWidth, 1);
  const currentTranslate = previewDirection === 'next'
    ? -previewProgress * slideDistance
    : previewDirection === 'prev'
      ? previewProgress * slideDistance
      : 0;
  const previewTranslate = previewDirection === 'next'
    ? slideDistance - previewProgress * slideDistance
    : previewDirection === 'prev'
      ? -slideDistance + previewProgress * slideDistance
      : 0;

  return <div
    ref={modalRef}
    className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-500 ease-out overscroll-none ${isBackgroundVisible ? 'bg-white' : 'bg-white/0'}`}
    onClick={onClose}
  >
    <button
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className="absolute z-30 right-3 sm:right-6 top-3 sm:top-6 h-10 w-10 rounded-full border border-black/15 bg-white/90 text-2xl leading-none text-black/60 hover:bg-white"
      aria-label="Закрыть"
    >
      ×
    </button>

    <button
      onClick={(event) => {
        event.stopPropagation();
        onPrev();
      }}
      className="absolute z-30 left-2 sm:left-6 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-black/15 bg-white/90 text-2xl sm:text-3xl leading-none text-black/60 hover:bg-white"
      aria-label="Предыдущее изображение"
    >
      ‹
    </button>

    <div
      className="flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing select-none touch-none"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      <div ref={stageRef} className="relative w-[95vw] h-[80vh] sm:h-[97.5vh] overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: 1 - previewProgress,
            transform: `translateX(${currentTranslate}px)`,
          }}
        >
          <img
            ref={currentImageRef}
            src={imageUrl}
            alt="Увеличенное изображение"
            className="block max-w-full max-h-full w-auto h-auto object-contain shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition-opacity duration-75"
            draggable={false}
            onLoad={() => {
              const width = currentImageRef.current?.getBoundingClientRect().width ?? 0;
              setCurrentImageWidth(width);
            }}
          />
        </div>

        {previewImageUrl && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              opacity: previewProgress,
              transform: `translateX(${previewTranslate}px)`,
            }}
          >
            <img
              ref={previewImageRef}
              src={previewImageUrl}
              alt={previewDirection === 'next' ? 'Следующее изображение' : 'Предыдущее изображение'}
              className="block max-w-full max-h-full w-auto h-auto object-contain shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition-opacity duration-75"
              draggable={false}
              onLoad={() => {
                const width = previewImageRef.current?.getBoundingClientRect().width ?? 0;
                setPreviewImageWidth(width);
              }}
            />
          </div>
        )}
      </div>

      {!hideImgName &&
        <p className="m-0 max-w-[95vw] text-center text-black break-words">
          {imageName}
        </p>
      }
    </div>

    <button
      onClick={(event) => {
        event.stopPropagation();
        onNext();
      }}
      className="absolute z-30 right-2 sm:right-6 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-black/15 bg-white/90 text-2xl sm:text-3xl leading-none text-black/60 hover:bg-white"
      aria-label="Следующее изображение"
    >
      ›
    </button>
  </div>;
}
