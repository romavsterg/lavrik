import { useState } from 'react';
import { login } from "../../api";

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const username = data.get('username')?.toString() || '';
    const password = data.get('password')?.toString() || '';

    try {
      await login(username, password);
      onLogin();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message === 'Invalid credentials' ? 'неверный логин/пароль' : err.message);
        return;
      }
      setError('Ошибка входа');
    }
  };

  return <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 border border-[#e5e5e5] rounded-lg max-[499px]:mt-4 max-[499px]:p-4">
    <input name="username" placeholder="Имя пользователя" required className="w-full px-3 py-2 border border-[#e5e5e5] rounded mb-3 text-base max-[499px]:py-2 max-[499px]:text-[17px]" />
    <input name="password" type="password" placeholder="Пароль" required className="w-full px-3 py-2 border border-[#e5e5e5] rounded mb-3 text-base max-[499px]:py-2 max-[499px]:text-[17px]" />
    <button type="submit" className="w-full px-4 py-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded hover:bg-[#333] text-base max-[499px]:text-[17px]">Войти</button>
    {error && <p className="text-red-600 text-sm text-center mt-3 max-[499px]:text-base">{error}</p>}
  </form>;
}
