import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProject,
  updateProject,
  addImage,
  removeImage,
  renameImage,
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [editingImageKey, setEditingImageKey] = useState<string | null>(null);
  const [editingImageName, setEditingImageName] = useState('');
  const [renamingImageKey, setRenamingImageKey] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImgName = (value: string) => {
    return value.split('/').pop()?.split('?')[0].split('-').slice(1).join('-') || '';
  };

  const buildRenamedKey = (key: string, name: string) => {
    const trimmed = name.trim().replaceAll('/', '-');
    if (!trimmed) return key;

    const slashIndex = key.lastIndexOf('/');
    const dir = slashIndex >= 0 ? key.slice(0, slashIndex) : '';
    const fileName = slashIndex >= 0 ? key.slice(slashIndex + 1) : key;
    const dashIndex = fileName.indexOf('-');
    const prefix = dashIndex >= 0 ? fileName.slice(0, dashIndex) : `${Date.now()}`;
    const oldExt = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';
    const hasExt = /\.[a-zA-Z0-9]+$/.test(trimmed);
    const finalName = hasExt ? trimmed : `${trimmed}${oldExt}`;
    const nextFileName = `${prefix}-${finalName}`;

    return dir ? `${dir}/${nextFileName}` : nextFileName;
  };

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
      setIsEditingTitle(false);
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

  const startImageRename = (key: string) => {
    setEditingImageKey(key);
    setEditingImageName(getImgName(key));
  };

  const cancelImageRename = () => {
    setEditingImageKey(null);
    setEditingImageName('');
  };

  const handleImageRename = async (key: string) => {
    const newKey = buildRenamedKey(key, editingImageName);

    if (!editingImageName.trim() || newKey === key) {
      cancelImageRename();
      return;
    }

    try {
      setRenamingImageKey(key);
      setError('');
      await renameImage(projectId, key, newKey);
      cancelImageRename();
      await loadProject();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка переименования изображения');
      }
    } finally {
      setRenamingImageKey(null);
    }
  };

  if (loading) return <p>Загрузка...</p>;

  if (!project) {
    return <p>Проект не найден</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 border border-[#e5e5e5] rounded-xl bg-white">
      <div className="flex items-start gap-3 mb-6">
        {isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleUpdate();
              }

              if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setEditingTitle(project.title);
              }
            }}
            className="text-3xl font-semibold px-4 py-3 border border-[#e5e5e5] rounded-md flex-1"
            autoFocus
          />
        ) : (
          <h2 className="text-3xl font-semibold m-0 flex-1 break-words">{project.title}</h2>
        )}

        <button
          onClick={isEditingTitle ? handleTitleUpdate : () => setIsEditingTitle(true)}
          disabled={updatingTitle}
          className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] disabled:opacity-50 whitespace-nowrap text-base"
        >
          {updatingTitle ? 'Сохранение...' : isEditingTitle ? 'Сохранить' : 'Изменить название'}
        </button>

        {isEditingTitle && (
          <button
            onClick={() => {
              setIsEditingTitle(false);
              setEditingTitle(project.title);
            }}
            className="px-5 py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 whitespace-nowrap text-base"
          >
            Отмена
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Изображения</h3>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] text-base"
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
              onChange={() => setUploadError('')}
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
          <div className="grid grid-cols-2 gap-4">
            {images.map((img) => (
              <div key={img.key} className="border border-[#e5e5e5] rounded-md overflow-hidden bg-white">
                {img.url ? (
                  <img src={img.url} alt="" className="w-full h-52 object-cover" />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400">
                    Недоступно
                  </div>
                )}

                <div className="p-3 border-t border-[#e5e5e5]">
                  {editingImageKey === img.key ? (
                    <input
                      type="text"
                      value={editingImageName}
                      onChange={(e) => setEditingImageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleImageRename(img.key);
                        }

                        if (e.key === 'Escape') {
                          cancelImageRename();
                        }
                      }}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-md text-sm mb-3"
                      autoFocus
                    />
                  ) : (
                    <p className="m-0 mb-3 text-sm text-[#333] break-all">{getImgName(img.key)}</p>
                  )}

                  <div className="flex items-center gap-3">
                    {editingImageKey === img.key ? (
                      <>
                        <button
                          onClick={() => handleImageRename(img.key)}
                          disabled={renamingImageKey === img.key}
                          className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                        >
                          {renamingImageKey === img.key ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          onClick={cancelImageRename}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startImageRename(img.key)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Переименовать
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteImage(img.key)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
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
