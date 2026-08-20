import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllProjects,
  createProject,
  deleteProject,
  changeProjectsOrder,
  type Project,
} from '../../api';

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'create'>('list');
  const [title, setTitle] = useState('');
  const [hideImgNames, setHideImgNames] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  const [initialProjectsOrder, setInitialProjectsOrder] = useState<Project[]>([]);

  const loadProjects = async () => {
    try {
      const data = await getAllProjects();

      setProjects(data.items);
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
      await createProject(title, hideImgNames);
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

  const moveProject = (index: number, direction: 'up' | 'down') => {
    setProjects((prev) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const updated = [...prev];
      [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];

      return updated;
    });
  };

  const handleStartEditOrder = () => {
    setInitialProjectsOrder(projects);
    setIsEditingOrder(true);
  };

  const handleCancelEditOrder = () => {
    setProjects(initialProjectsOrder);
    setIsEditingOrder(false);
    setError('');
  };

  const handleSaveOrder = async () => {
    setSubmitting(true);
    setError('');

    try {
      await changeProjectsOrder(projects.map((project) => project.id));
      setInitialProjectsOrder(projects);
      setIsEditingOrder(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка сохранения порядка');
      }
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto mt-8 p-8 border border-[#e5e5e5] rounded-xl bg-white max-[499px]:mt-4 max-[499px]:p-4 max-[499px]:rounded-lg">
      <h2 className="text-2xl font-semibold mb-5 max-[499px]:mb-4 max-[499px]:text-[1.75rem]">Проекты</h2>

      {error && <p className="text-red-600 text-sm mb-4 max-[499px]:text-base">{error}</p>}

      {view === 'list' && (
        <div>
          <div className="mb-5 flex gap-2 max-[499px]:mb-4 max-[499px]:flex-col sticky top-0 bg-white py-4">
            {!isEditingOrder ? (
              <>
                <button
                  onClick={() => setView('create')}
                  className="px-5 py-2.5 text-base bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                >
                  Создать проект
                </button>

                <button
                  onClick={handleStartEditOrder}
                  disabled={projects.length < 2}
                  className="px-5 py-2.5 text-base border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50 max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                >
                  Изменить порядок отображения
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveOrder}
                  disabled={submitting}
                  className="px-5 py-2.5 text-base bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] disabled:opacity-50 max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                >
                  {submitting ? 'Сохранение...' : 'Сохранить'}
                </button>

                <button
                  onClick={handleCancelEditOrder}
                  disabled={submitting}
                  className="px-5 py-2.5 text-base border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50 max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                >
                  Отменить
                </button>
              </>
            )}
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500">Нет проектов</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-base max-[499px]:text-[17px]">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="text-left py-3 px-4 font-medium max-[499px]:py-2 max-[499px]:px-2">Название</th>
                    <th className="text-left py-3 px-4 font-medium max-[499px]:py-2 max-[499px]:px-2">Дата обновления</th>
                    {isEditingOrder && <th className="text-center py-2 px-3 font-medium max-[499px]:py-2 max-[499px]:px-2">Порядок</th>}
                    <th className="text-right py-2 px-3 font-medium max-[499px]:py-2 max-[499px]:px-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr key={project.id} className="border-b border-[#e5e5e5]">
                      <td className="py-3 px-4 max-[499px]:py-2 max-[499px]:px-2">
                        <Link
                          to={`/?id=${project.id}`}
                          className="text-[#1a1a1a] no-underline hover:underline text-lg max-[499px]:text-xl"
                        >
                          {project.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#444] max-[499px]:py-2 max-[499px]:px-2">{formatDate(project.updatedAt || project.createdAt)}</td>
                      {isEditingOrder && (
                        <td className="py-3 px-4 text-center max-[499px]:py-2 max-[499px]:px-2">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => moveProject(index, 'up')}
                              disabled={index === 0 || submitting}
                              className="px-3 py-1 border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveProject(index, 'down')}
                              disabled={index === projects.length - 1 || submitting}
                              className="px-3 py-1 border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3 text-right max-[499px]:py-2 w-80">
                        {!isEditingOrder && (
                          deletingProjectId === project.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="text-red-600 hover:text-red-800 text-base max-[499px]:text-[17px] mr-4"
                              >
                                Подтвердить удаление
                              </button>
                              <button
                                onClick={() => setDeletingProjectId(null)}
                                className="text-gray-600 hover:text-gray-800 text-base max-[499px]:text-[17px]"
                              >
                                Отмена
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeletingProjectId(project.id)}
                              className="text-red-600 hover:text-red-800 text-base max-[499px]:text-[17px]"
                            >
                              Удалить
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-4 max-[499px]:gap-3">
          <div>
            <label htmlFor="title" className="block text-base mb-1 max-[499px]:text-[17px]">Название</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-md text-base max-[499px]:px-3 max-[499px]:py-2 max-[499px]:text-[17px]"
            />
          </div>
          <div className='flex justify-start items-center gap-2'>
            <input
              id="hideImgNames"
              type="checkbox"
              checked={hideImgNames}
              onChange={() => setHideImgNames(prev => !prev)}
              className="w-6 h-6"
            />
            <label htmlFor="hideImgNames" className="block text-base max-[499px]:text-[17px]">Скрывать названия изображений</label>
          </div>
          <div className="flex gap-2 mt-2 max-[499px]:mt-1 max-[499px]:flex-col">
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-5 py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 text-base max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
            >
              Назад к списку
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] disabled:opacity-50 text-base max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
            >
              {submitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
