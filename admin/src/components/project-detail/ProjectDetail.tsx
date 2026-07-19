import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProject,
  updateProject,
  addImage,
  removeImage,
  getProjectImageUrls,
  getUploadUrl,
  deleteFile,
  type Project,
} from '../../api';

interface ImageItem {
  key: string;
  url: string;
}

export default function ProjectDetail({ projectId }: { projectId: number }) {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProject = async () => {
    try {
      const data = await getProject(projectId);
      setProject(data);
      setEditingTitle(data.title);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка загрузки проекта');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    if (!project) return;
    try {
      const data = await getProjectImageUrls(project.id);
      setImages(data.urls.map((url: string, index: number) => ({
        key: project.imgPaths[index],
        url,
      })));
    } catch {
      setImages(project.imgPaths.map((key) => ({ key, url: '' })));
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      loadImages();
    }
  }, [project]);

  const handleTitleUpdate = async () => {
    if (!editingTitle.trim() || !project) return;
    setUpdatingTitle(true);
    setError('');

    try {
      await updateProject(project.id, editingTitle.trim());
      setProject((prev) => prev ? { ...prev, title: editingTitle.trim() } : null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка обновления названия');
      }
    } finally {
      setUpdatingTitle(false);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Можно загружать только изображения');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const key = `projects/${projectId}/${Date.now()}-${file.name}`;
      const { url } = await getUploadUrl(key, file.type);

      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      await addImage(projectId, key);
      await loadImages();
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError('Ошибка загрузки изображения');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (key: string) => {
    try {
      await removeImage(projectId, key);
      await deleteFile(key);
      setImages((prev) => prev.filter((img) => img.key !== key));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка удаления изображения');
      }
    }
  };

  if (loading) return <p>Загрузка...</p>;

  if (!project) {
    return <p>Проект не найден</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border border-[#e5e5e5] rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTitleUpdate();
            }
          }}
          className="text-2xl font-semibold px-3 py-2 border border-[#e5e5e5] rounded flex-1"
        />
        <button
          onClick={handleTitleUpdate}
          disabled={updatingTitle}
          className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333] disabled:opacity-50 whitespace-nowrap"
        >
          {updatingTitle ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Изображения</h3>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333]"
          >
            {showUploadForm ? 'Скрыть форму' : 'Добавить изображение'}
          </button>
        </div>

        {showUploadForm && (
          <div className="mb-4 p-4 border border-[#e5e5e5] rounded">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setUploadError('')}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded mb-3"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333] disabled:opacity-50"
            >
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
            {uploadError && <p className="text-red-600 text-sm mt-3">{uploadError}</p>}
          </div>
        )}

        {images.length === 0 ? (
          <p className="text-gray-500">Нет изображений</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img) => (
              <div key={img.key} className="relative border border-[#e5e5e5] rounded overflow-hidden">
                {img.url ? (
                  <img src={img.url} alt="" className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    Недоступно
                  </div>
                )}
                <button
                  onClick={() => handleDeleteImage(img.key)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 border border-[#e5e5e5] rounded hover:bg-gray-50"
      >
        Назад к списку
      </button>
    </div>
  );
}
