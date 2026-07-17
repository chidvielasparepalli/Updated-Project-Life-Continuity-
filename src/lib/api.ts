const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Custom fetch wrapper that guarantees all API requests are routed to the configured backend origin (Railway).
 * Resolves both "/api/some-endpoint" and "some-endpoint" formats correctly.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const finalPath = cleanPath.startsWith("/api") ? cleanPath : `/api${cleanPath}`;
  const url = `${API_BASE}${finalPath}`;

  return fetch(url, options);
}
