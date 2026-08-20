import { useState, useEffect } from 'react';
import { getProject, getProjectImages } from '../../api';
import { useParams } from 'react-router-dom';
import ProjectImagesGrid from '../../components/project/project-images-grid';
import ProjectImageModal from '../../components/project/project-image-modal';

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 500);

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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

  const showPrevImage = () => {
    if (selectedImageIndex === null || modalImages.length === 0) {
      return;
    }

    setSelectedImageIndex(selectedImageIndex === 0 ? modalImages.length - 1 : selectedImageIndex - 1);
  };

  const showNextImage = () => {
    if (selectedImageIndex === null || modalImages.length === 0) {
      return;
    }

    setSelectedImageIndex(selectedImageIndex === modalImages.length - 1 ? 0 : selectedImageIndex + 1);
  };

  const getImgName = (url: string) => {
    return url.split('/').pop()?.split('?')[0].split('-').slice(1).join('-').split('.').slice(0, -1).join('.') || '';
  };

  const imagesLimit = isMobile ? 3 : 6;
  const displayedImages = showAllImages ? images : images.slice(0, imagesLimit);
  const modalImages = showAllImages ? images : images.slice(0, imagesLimit);

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
        />

        {images.length > imagesLimit && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="px-4 py-2 rounded border border-[#cfcfcf] text-[#333] hover:border-black hover:text-black transition-colors w-[220px] max-w-full"
              onClick={() => setShowAllImages(prev => !prev)}
            >
              {showAllImages ? 'Скрыть остальные' : 'Показать остальные'}
            </button>
          </div>
        )}
      </>
    )}

    {selectedImageIndex !== null && (
      <ProjectImageModal
        imageUrl={modalImages[selectedImageIndex]}
        imageName={getImgName(modalImages[selectedImageIndex]) ?? ''}
        onClose={() => setSelectedImageIndex(null)}
        onPrev={showPrevImage}
        onNext={showNextImage}
        hideImgName={project.hideImgNames}
      />
    )}
  </main>;
}
