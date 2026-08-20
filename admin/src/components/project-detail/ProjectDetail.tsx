import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProject,
  updateProject,
  addImage,
  removeImage,
  renameImage,
  changeProjectImagesOrder,
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
  const [deletingImageKey, setDeletingImageKey] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isEditingImagesOrder, setIsEditingImagesOrder] = useState(false);
  const [initialImagesOrder, setInitialImagesOrder] = useState<ImageItem[]>([]);
  const [savingImagesOrder, setSavingImagesOrder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImgName = (value: string) => {
    if (!value) return '';
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

  const handleHideImgNamesUpdate = async () => {
    if (!project) return;
    setError('');

    try {
      await updateProject(project.id, editingTitle.trim(), !project.hideImgNames);
      setProject((prev) => prev ? { ...prev, hideImgNames: !prev.hideImgNames } : null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка обновления опции показа названий изображений');
      }
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
      // const { url } = await getUploadUrl(key, file.type);

      // await fetch(url, {
      //   method: 'PUT',
      //   body: file,
      //   headers: {
      //     'Content-Type': file.type,
      //   },
      // });

      await addImage(projectId, key);
      
      project?.imgPaths.push(key);
      
      await loadImages();
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
      setDeletingImageKey(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка удаления изображения');
      }
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const updated = [...prev];
      [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];

      return updated;
    });
  };

  const handleStartEditImagesOrder = () => {
    setInitialImagesOrder(images);
    setIsEditingImagesOrder(true);
    setShowUploadForm(false);
    setError('');
  };

  const handleCancelEditImagesOrder = () => {
    setImages(initialImagesOrder);
    setIsEditingImagesOrder(false);
    setError('');
  };

  const handleSaveImagesOrder = async () => {
    setSavingImagesOrder(true);
    setError('');

    try {
      const imageKeys = images.map((image) => image.key);
      await changeProjectImagesOrder(projectId, imageKeys);
      setProject((prev) => (prev ? { ...prev, imgPaths: imageKeys } : prev));
      setInitialImagesOrder(images);
      setIsEditingImagesOrder(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка сохранения порядка изображений');
      }
    } finally {
      setSavingImagesOrder(false);
    }
  };

  const startImageRename = (key: string) => {
    setDeletingImageKey(null)
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
    <div className="max-w-4xl mx-auto mt-8 p-8 border border-[#e5e5e5] rounded-xl bg-white max-[499px]:mt-4 max-[499px]:p-4 max-[499px]:rounded-lg">
      <div className="flex items-start gap-3 mb-6 max-[499px]:mb-4 max-[499px]:gap-2 max-[499px]:flex-col max-[499px]:items-stretch">
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
            className="text-3xl font-semibold px-4 py-3 border border-[#e5e5e5] rounded-md flex-1 max-[499px]:text-[2rem] max-[499px]:px-3 max-[499px]:py-2"
            autoFocus
          />
        ) : (
          <h2 className="text-3xl font-semibold m-0 flex-1 break-words max-[499px]:text-[2rem]">{project.title}</h2>
        )}

        <button
          onClick={isEditingTitle ? handleTitleUpdate : () => setIsEditingTitle(true)}
          disabled={updatingTitle}
          className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] disabled:opacity-50 whitespace-nowrap text-base max-[499px]:w-full max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
        >
          {updatingTitle ? 'Сохранение...' : isEditingTitle ? 'Сохранить' : 'Изменить название'}
        </button>

        {isEditingTitle && (
          <button
            onClick={() => {
              setIsEditingTitle(false);
              setEditingTitle(project.title);
            }}
            className="px-5 py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 whitespace-nowrap text-base max-[499px]:w-full max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
          >
            Отмена
          </button>
        )}
      </div>
      
      <div className="flex items-start gap-3 mb-6 max-[499px]:mb-4 max-[499px]:gap-2 max-[499px]:flex-col max-[499px]:items-stretch">
        <input
          id="hideImgNames"
          type="checkbox"
          checked={project.hideImgNames}
          onChange={handleHideImgNamesUpdate}
          className="w-6 h-6"
        />
        <label htmlFor="hideImgNames" className="block text-base max-[499px]:text-[17px]">Скрывать названия изображений</label>
      </div>

      {error && <p className="text-red-600 text-sm mb-4 max-[499px]:text-base">{error}</p>}

      <div className="mb-6">
          <div className="flex items-center justify-between mb-4 max-[499px]:mb-3 max-[499px]:flex-col max-[499px]:items-stretch max-[499px]:gap-2 sticky top-0 py-4 bg-white z-10">
            <h3 className="text-xl font-medium max-[499px]:text-2xl">Изображения</h3>
            <div className="flex items-center gap-2 max-[499px]:flex-col max-[499px]:items-stretch">
              {isEditingImagesOrder ? (
                <>
                  <button
                    onClick={handleSaveImagesOrder}
                    disabled={savingImagesOrder}
                    className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] disabled:opacity-50 text-base max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                  >
                    {savingImagesOrder ? 'Сохранение...' : 'Сохранить порядок'}
                  </button>
                  <button
                    onClick={handleCancelEditImagesOrder}
                    disabled={savingImagesOrder}
                    className="px-5 py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50 text-base max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                  >
                    Отменить
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-md hover:bg-[#333] text-base max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                  >
                    {showUploadForm ? 'Скрыть форму' : 'Добавить изображение'}
                  </button>
                  <button
                    onClick={handleStartEditImagesOrder}
                    disabled={images.length < 2}
                    className="px-5 py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50 text-base max-[499px]:px-4 max-[499px]:py-2 max-[499px]:text-[17px]"
                  >
                    Изменить порядок отображения
                  </button>
                </>
              )}
            </div>
          </div>

        {showUploadForm && (
          <div className="mb-4 p-4 border border-[#e5e5e5] rounded max-[499px]:mb-3 max-[499px]:p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={() => setUploadError('')}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded mb-3 text-base max-[499px]:mb-2 max-[499px]:text-[17px]"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333] disabled:opacity-50 text-base max-[499px]:px-3 max-[499px]:py-2 max-[499px]:text-[17px]"
            >
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
            {uploadError && <p className="text-red-600 text-sm mt-3 max-[499px]:text-base">{uploadError}</p>}
          </div>
        )}

        {images.length === 0 ? (
          <p className="text-gray-500">Нет изображений</p>
        ) : (
          <div className={`grid ${isEditingImagesOrder ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mt-8 max-[499px]:grid-cols-1 max-[499px]:gap-3`}>
            {images.map((img, index) => (
              <div key={img.key} className={`relative border w-full max-w-101.25 ml-auto mr-auto ${editingImageKey === img.key ? 'border-#a5a5a5' : (index === 0 ? 'border-#8b0000' : 'border-[#e5e5e5]')} rounded-md bg-white`}>
                {index === 0 && 
                  <span className='absolute z-0 text-black/60' style={{top: '-25px', left: '50%', transform: 'translateX(-50%)'} as CSSProperties}>Обложка проекта</span>
                }
                
                {img.url ? (
                  <img src={img.url} alt="" className="w-full h-52 object-cover max-[499px]:h-48" />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400 max-[499px]:h-48">
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
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-md text-sm mb-3 max-[499px]:mb-2 max-[499px]:text-base"
                      autoFocus
                    />
                  ) : (
                    <p className="m-0 mb-3 text-sm text-[#333] break-all max-[499px]:mb-2 max-[499px]:text-base">{getImgName(img.key)}</p>
                  )}

                  {isEditingImagesOrder ? (
                    <div className="flex items-center gap-2 max-[499px]:flex-wrap">
                      <button
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0 || savingImagesOrder}
                        className="px-3 py-1 border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === images.length - 1 || savingImagesOrder}
                        className="px-3 py-1 border border-[#e5e5e5] rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        ↓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 max-[499px]:gap-2 max-[499px]:flex-wrap">
                      {editingImageKey === img.key ? (
                      <>
                        <button
                          onClick={() => handleImageRename(img.key)}
                          disabled={renamingImageKey === img.key}
                          className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50 max-[499px]:text-base"
                        >
                          {renamingImageKey === img.key ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          onClick={cancelImageRename}
                          className="text-gray-600 hover:text-gray-800 text-sm max-[499px]:text-base"
                        >
                          Отмена
                        </button>
                      </>
                      ) : (
                        <button
                          onClick={() => startImageRename(img.key)}
                          className="text-blue-600 hover:text-blue-800 text-sm max-[499px]:text-base"
                        >
                          Переименовать
                        </button>
                      )}

                      {deletingImageKey === img.key ? (
                        <>
                          <button
                            onClick={() => setDeletingImageKey(null)}
                            className="text-gray-600 hover:text-gray-800 text-sm max-[499px]:text-base"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => handleDeleteImage(img.key)}
                            className="text-red-600 hover:text-red-800 text-sm max-[499px]:text-base"
                          >
                            Подтвердить удаление
                          </button>
                        </>
                        ) : (
                          <button
                          onClick={() => {setEditingImageKey(null); setDeletingImageKey(img.key)}}
                          className="text-red-600 hover:text-red-800 text-sm max-[499px]:text-base"
                          >
                            Удалить
                          </button>
                        )
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 border border-[#e5e5e5] rounded hover:bg-gray-50 text-base max-[499px]:px-3 max-[499px]:py-2 max-[499px]:text-[17px]"
      >
        Назад к списку
      </button>
    </div>
  );
}
