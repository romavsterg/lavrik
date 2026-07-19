import type { Route } from "../+types/portfolio";
import { useState, useEffect } from 'react';
import ProjectCard from '~/components/project-card';
import type { Project } from '~/components/project-card';
import { getProjects } from '~/api';
import './portfolio.css';

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

  return <main>
    <h1>Портфолио</h1>
    <p>Примеры реализованных проектов по дизайну интерьеров квартир.</p>

    {loading ? (
      <p>Загрузка...</p>
    ) : (
      <div className="project-list">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    )}
  </main>;
}
