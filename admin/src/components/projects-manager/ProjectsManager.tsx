import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from '../../api';

export default function ProjectsManager() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'create'>('list');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const handleUpdate = async (id: number) => {
    if (!editingTitle.trim()) return;
    setUpdatingId(id);

    try {
      await updateProject(id, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
      await loadProjects();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка обновления проекта');
      }
    } finally {
      setUpdatingId(null);
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

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditingTitle(project.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
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
    <div className="max-w-2xl mx-auto mt-10 p-6 border border-[#e5e5e5] rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Проекты</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {view === 'list' && (
        <div>
          <button
            onClick={() => setView('create')}
            className="mb-4 px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333]"
          >
            Создать проект
          </button>

          {projects.length === 0 ? (
            <p className="text-gray-500">Нет проектов</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left py-2 px-3 font-medium">Название</th>
                  <th className="text-left py-2 px-3 font-medium">Дата обновления</th>
                  <th className="text-right py-2 px-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-[#e5e5e5]">
                    <td className="py-2 px-3">
                      {editingId === project.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdate(project.id);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          className="w-full px-2 py-1 border border-[#e5e5e5] rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => startEditing(project)}
                        >
                          {project.title}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">{formatDate(project.updatedAt || project.createdAt)}</td>
                    <td className="py-2 px-3 text-right">
                      {editingId === project.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleUpdate(project.id)}
                            disabled={updatingId === project.id}
                            className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                          >
                            {updatingId === project.id ? 'Сохранение...' : 'Сохранить'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => navigate(`/?id=${project.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Открыть
                          </button>
                          <button
                            onClick={() => startEditing(project)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm mb-1">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-4 py-2 border border-[#e5e5e5] rounded hover:bg-gray-50"
            >
              Назад к списку
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333] disabled:opacity-50"
            >
              {submitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
