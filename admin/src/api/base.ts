export const fetch = async (url: string, options?: RequestInit) => {
  const response = await window.fetch('http://localhost:5050' + url, {
    credentials: 'include', 
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  console.log(response)

  return response.json();
};