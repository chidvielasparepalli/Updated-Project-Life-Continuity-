const getApiBase = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      return "";
    }
  }
  return import.meta.env.VITE_API_BASE_URL || "";
};

const API_BASE = getApiBase();

console.log("API_BASE =", API_BASE);

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const finalPath = cleanPath.startsWith("/api") ? cleanPath : `/api${cleanPath}`;
  const url = `${API_BASE}${finalPath}`;

  console.log("FETCH URL:", url);

  return fetch(url, options);
}