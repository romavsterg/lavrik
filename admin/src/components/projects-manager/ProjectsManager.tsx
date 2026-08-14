import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllProjects,
  createProject,
  deleteProject,
  type Project,
} from '../../api';

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'create'>('list');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка загрузки проектов');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createProject(title);
      setTitle('');
      setView('list');
      await loadProjects();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка создания проекта');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка удаления проекта');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 border border-[#e5e5e5] rounded-xl bg-white">
      <h2 className="text-2xl font-semibold mb-5">Проекты</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {view === 'list' && (
        <div>
          <button
            onClick={() => setView('create')}
            className="mb-5 px-5 py-2.5 text-base bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333]"
          >
            Создать проект
          </button>

          {projects.length === 0 ? (
            <p className="text-gray-500">Нет проектов</p>
          ) : (
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left py-3 px-4 font-medium">Название</th>
                  <th className="text-left py-3 px-4 font-medium">Дата обновления</th>
                  <th className="text-right py-2 px-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-[#e5e5e5]">
                    <td className="py-3 px-4">
                      <Link
                        to={`/?id=${project.id}`}
                        className="text-[#1a1a1a] no-underline hover:underline text-lg"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[#444]">{formatDate(project.updatedAt || project.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 hover:text-red-800 text-base"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-base mb-1">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-md text-base"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-5 py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 text-base"
            >
              Назад к списку
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] disabled:opacity-50 text-base"
            >
              {submitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
