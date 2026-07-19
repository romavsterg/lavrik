import type { Route } from "../+types/project";
import { useState, useEffect } from 'react';
import { getProject, getProjectImages } from '~/api';
import './project.css';
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

  if (loading) return <main><p>Загрузка...</p></main>;

  if (!project) return <main><p>Проект не найден</p></main>;

  return <main>
    <h1>{project.title}</h1>
    <p>Обновлен: {formatDate(project.updatedAt)}</p>

    {images.length === 0 ? (
      <p>Нет изображений</p>
    ) : (
      <div className="project-images">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`${project.title} ${index + 1}`} />
        ))}
      </div>
    )}
  </main>;
}
