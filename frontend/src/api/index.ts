export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5050');

export const fetch = async (url: string, options?: RequestInit) => {
  const response = await window.fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error((await response.json()).message || 'Request failed');
  }

  return response.json();
};

export const getProjects = (limit = 6, page = 1) =>
  fetch(`/projects/public?limit=${limit}&page=${page}`);

export const getProject = (id: number) =>
  fetch(`/projects/${id}`);

export const getProjectImages = (id: number) =>
  fetch(`/projects/${id}/images`);
