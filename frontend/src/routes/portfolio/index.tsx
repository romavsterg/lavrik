import { useState, useEffect } from 'react';
import ProjectCard from '../../components/project/project-card';
import type { Project } from '../../components/project/project-card';
import { getProjects } from '../../api';

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

  return <main className="px-4 sm:px-6 max-w-[960px] mx-auto py-6">
    {loading ? (
      <p className="m-0 mb-4 text-[#333]">Загрузка...</p>
    ) : (
      <div className="grid gap-5 mt-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    )}
  </main>;
}
