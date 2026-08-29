import { useState, useEffect, useMemo, useRef } from 'react';
import { getProject, getProjectImages } from '../../api';
import { useParams } from 'react-router-dom';
import ProjectImagesGrid from '../../components/project/project-images-grid';
import ProjectImageModal from '../../components/project/project-image-modal';

const LAZY_BATCH_SIZE = 3;

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 500);
  const [visibleCount, setVisibleCount] = useState(0);
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isInitialBatchLoaded, setIsInitialBatchLoaded] = useState(false);
  const initialLoadedIndexesRef = useRef<Set<number>>(new Set());
  const visibleCountRef = useRef(0);
  const preloadedCountRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, imagesData] = await Promise.all([
          getProject(Number(id)),
          getProjectImages(Number(id)),
        ]);
        setProject(projectData);
        setImages(imagesData.urls);
        setShowAllImages(false);
        setSelectedImageIndex(null);
        setIsInitialBatchLoaded(false);
        initialLoadedIndexesRef.current = new Set();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    document.title = 'Наталья Лаврик | Проекты';
  }, []);

  useEffect(() => {
    if (selectedImageIndex === null) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedImageIndex]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const imagesLimit = isMobile ? 3 : 6;

  useEffect(() => {
    const initialCount = Math.min(images.length, imagesLimit);
    setVisibleCount(initialCount);
    setPreloadedCount(initialCount);
    setIsInitialBatchLoaded(initialCount === 0);
    initialLoadedIndexesRef.current = new Set();
  }, [images, imagesLimit]);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    preloadedCountRef.current = preloadedCount;
  }, [preloadedCount]);

  const queuePreloadFrom = (fromCount: number) => {
    setPreloadedCount((prevCount) => {
      const nextCount = Math.min(images.length, fromCount + LAZY_BATCH_SIZE);
      return nextCount > prevCount ? nextCount : prevCount;
    });
  };

  useEffect(() => {
    if (!isInitialBatchLoaded) {
      return;
    }

    queuePreloadFrom(visibleCountRef.current);
  }, [isInitialBatchLoaded]);

  const revealNextBatch = () => {
    setVisibleCount((prevCount) => {
      if (prevCount >= images.length) {
        return prevCount;
      }

      const revealTo = preloadedCountRef.current > prevCount
        ? preloadedCountRef.current
        : Math.min(images.length, prevCount + LAZY_BATCH_SIZE);

      if (revealTo > prevCount) {
        queuePreloadFrom(revealTo);
      }

      return revealTo;
    });
  };

  const handleGridImageLoad = (index: number) => {
    if (index >= imagesLimit || isInitialBatchLoaded) {
      return;
    }

    if (initialLoadedIndexesRef.current.has(index)) {
      return;
    }

    initialLoadedIndexesRef.current.add(index);
    const expectedInitialCount = Math.min(images.length, imagesLimit);

    if (initialLoadedIndexesRef.current.size >= expectedInitialCount) {
      setIsInitialBatchLoaded(true);
    }
  };

  const showPrevImage = () => {
    setSelectedImageIndex((prevIndex) => {
      const currentVisibleCount = visibleCountRef.current;

      if (prevIndex === null || currentVisibleCount === 0) {
        return prevIndex;
      }

      return prevIndex === 0 ? currentVisibleCount - 1 : prevIndex - 1;
    });
  };

  const showNextImage = () => {
    setSelectedImageIndex((prevIndex) => {
      const currentVisibleCount = visibleCountRef.current;

      if (prevIndex === null || currentVisibleCount === 0) {
        return prevIndex;
      }

      if (prevIndex < currentVisibleCount - 1) {
        return prevIndex + 1;
      }

      if (currentVisibleCount < images.length) {
        const revealTo = preloadedCountRef.current > currentVisibleCount
          ? preloadedCountRef.current
          : Math.min(images.length, currentVisibleCount + LAZY_BATCH_SIZE);

        setVisibleCount(revealTo);
        queuePreloadFrom(revealTo);
        return prevIndex + 1;
      }

      return 0;
    });
  };

  const getImgName = (url: string) => {
    return url.split('/').pop()?.split('?')[0].split('-').slice(1).join('-').split('.').slice(0, -1).join('.') || '';
  };

  const displayedImages = showAllImages ? images.slice(0, visibleCount) : images.slice(0, imagesLimit);
  const modalImages = useMemo(() => images.slice(0, visibleCount), [images, visibleCount]);
  const hiddenPreloadImages = useMemo(() => images.slice(visibleCount, preloadedCount), [images, visibleCount, preloadedCount]);

  if (loading) return <main className="px-4 sm:px-6 max-w-[960px] mx-auto py-6"><p className="m-0 mb-4 text-[#333]">Загрузка...</p></main>;
  if (!project) return <main className="px-4 sm:px-6 max-w-[960px] mx-auto py-6"><p className="m-0 mb-4 text-[#333]">Проект не найден</p></main>;

  return <main className="px-4 sm:px-6 w-full mx-auto py-4">
    <h1 className="text-2xl sm:text-3xl font-medium m-0 mb-2 break-words">{project.title}</h1>

    {images.length === 0 ? (
      <p className="m-0 mb-4 text-[#333]">Нет изображений</p>
    ) : (
      <>
        <ProjectImagesGrid
          images={displayedImages}
          projectTitle={project.title}
          getImgName={getImgName}
          onSelect={setSelectedImageIndex}
          hideImgNames={project.hideImgNames}
          onImageLoad={handleGridImageLoad}
        />

        {images.length > imagesLimit && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="px-4 py-2 rounded border border-[#cfcfcf] text-[#333] hover:border-black hover:text-black transition-colors w-[220px] max-w-full"
              onClick={() => {
                if (!showAllImages) {
                  setShowAllImages(true);
                  setVisibleCount(images.length);
                  setPreloadedCount(images.length);
                  return;
                }

                setShowAllImages(false);
              }}
            >
              {showAllImages ? 'Скрыть остальные' : 'Показать остальные'}
            </button>
          </div>
        )}

        {hiddenPreloadImages.length > 0 && (
          <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden>
            {hiddenPreloadImages.map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt="" loading="lazy" decoding="async" />
            ))}
          </div>
        )}
      </>
    )}

    {selectedImageIndex !== null && modalImages[selectedImageIndex] && (
      <ProjectImageModal
        imageUrl={modalImages[selectedImageIndex]}
        prevImageUrl={modalImages[selectedImageIndex === 0 ? modalImages.length - 1 : selectedImageIndex - 1]}
        nextImageUrl={selectedImageIndex === modalImages.length - 1
          ? images.length > modalImages.length
            ? images[selectedImageIndex + 1]
            : modalImages[0]
          : modalImages[selectedImageIndex + 1]}
        imageName={getImgName(modalImages[selectedImageIndex]) ?? ''}
        onClose={() => setSelectedImageIndex(null)}
        onPrev={showPrevImage}
        onNext={showNextImage}
        hideImgName={project.hideImgNames}
      />
    )}
  </main>;
}
