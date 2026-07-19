import { useState, useRef } from 'react';
import { getUploadUrl, getDownloadUrl, deleteFile } from '../../api';

interface UploadedFile {
  key: string;
  url: string;
}

export default function UploadManager() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const key = `uploads/${Date.now()}-${file.name}`;
      const { url } = await getUploadUrl(key, file.type);

      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      const { url: downloadUrl } = await getDownloadUrl(key);
      setFiles((prev) => [...prev, { key, url: downloadUrl }]);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка загрузки');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteFile(key);
      setFiles((prev) => prev.filter((f) => f.key !== key));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка удаления');
      }
    }
  };

  return <div className="max-w-sm mx-auto mt-10 p-6 border border-[#e5e5e5] rounded-lg">
    <h2 className="text-xl font-semibold mb-4">Загрузка файлов</h2>

    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full px-3 py-2 border border-[#e5e5e5] rounded"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333] disabled:opacity-50"
      >
        {uploading ? 'Загрузка...' : 'Загрузить'}
      </button>
    </div>

    {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

    {files.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Загруженные файлы</h3>
        <ul className="flex flex-col gap-2">
          {files.map((f) => (
            <li key={f.key} className="flex items-center justify-between border border-[#e5e5e5] rounded px-3 py-2">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate mr-2">
                {f.key.split('/').pop()}
              </a>
              <button onClick={() => handleDelete(f.key)} className="text-red-600 hover:text-red-800 text-sm whitespace-nowrap">
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>;
}
