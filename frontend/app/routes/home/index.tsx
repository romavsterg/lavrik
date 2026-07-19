import type { Route } from "../+types/home";
import { useState, useEffect } from 'react';
import HeroSection from '~/components/hero-section';
import ProjectCard from '~/components/project-card';
import type { Project } from '~/components/project-card';
import { getProjects } from '~/api';
import './home.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Наталия Лаврик" },
  ];
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects(6, page);
      setProjects(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page]);

  return <main>
    <HeroSection />

    <section className="featured">
      <h2>Избранные проекты</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <div className="project-list">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#e5e5e5] rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Назад
              </button>
              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#e5e5e5] rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </section>
  </main>;
}
