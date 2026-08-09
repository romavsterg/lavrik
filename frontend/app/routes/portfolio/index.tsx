import type { Route } from "../+types/portfolio";
import { useState, useEffect } from 'react';
import ProjectCard from '~/components/project-card';
import type { Project } from '~/components/project-card';
import { getProjects } from '~/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Портфолио" },
  ];
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjects(100, 1);
        setProjects(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return <main className="px-6 max-w-[960px] mx-auto py-6">
    <h1 className="text-3xl font-medium m-0 mb-2">Портфолио</h1>
    <p className="m-0 mb-4 text-[#333]">Примеры реализованных проектов по дизайну интерьеров квартир.</p>

    {loading ? (
      <p className="m-0 mb-4 text-[#333]">Загрузка...</p>
    ) : (
      <div className="grid gap-5 mt-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    )}
  </main>;
}
