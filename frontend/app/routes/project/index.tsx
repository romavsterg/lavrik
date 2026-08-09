import type { Route } from "../+types/project";
import { useState, useEffect } from 'react';
import { getProject, getProjectImages } from '~/api';
import { useParams } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Проект ${params.id}` },
  ];
}

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, imagesData] = await Promise.all([
          getProject(Number(id)),
          getProjectImages(Number(id)),
        ]);
        setProject(projectData);
        setImages(imagesData.urls);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) return <main className="px-6 max-w-[960px] mx-auto py-6"><p className="m-0 mb-4 text-[#333]">Загрузка...</p></main>;
  if (!project) return <main className="px-6 max-w-[960px] mx-auto py-6"><p className="m-0 mb-4 text-[#333]">Проект не найден</p></main>;

  return <main className="px-6 max-w-[960px] mx-auto py-6">
    <h1 className="text-3xl font-medium m-0 mb-2">{project.title}</h1>
    <p className="m-0 mb-4 text-[#333]">Обновлен: {formatDate(project.updatedAt)}</p>

    {images.length === 0 ? (
      <p className="m-0 mb-4 text-[#333]">Нет изображений</p>
    ) : (
      <div className="grid gap-4 mt-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`${project.title} ${index + 1}`} className="w-full h-auto border border-[#e5e5e5] rounded-lg" />
        ))}
      </div>
    )}
  </main>;
}
