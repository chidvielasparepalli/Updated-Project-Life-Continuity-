const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

console.log("API_BASE =", API_BASE);

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const finalPath = cleanPath.startsWith("/api") ? cleanPath : `/api${cleanPath}`;
  const url = `${API_BASE}${finalPath}`;

  console.log("FETCH URL:", url);

  return fetch(url, options);
}