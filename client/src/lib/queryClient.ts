import { QueryClient, QueryFunction } from "@tanstack/react-query";

// L'URL de ton backend Railway
const API_URL = "https://sitefinal-production-3d8c.up.railway.app";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ajout d'une vérification pour éviter les doubles slashes //
  const fullUrl = url.startsWith('/') ? `${API_URL}${url}` : `${API_URL}/${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    // Change "include" par "same-origin" si tu n'utilises pas de cookies de session complexes
    credentials: "omit", 
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn: <T>(options: { on401: "returnNull" | "throw" }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    // On s'assure que le chemin commence par /
    const fullUrl = path.startsWith('/') ? `${API_URL}${path}` : `${API_URL}/${path}`;
    
    const res = await fetch(fullUrl, {
      credentials: "omit",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5000, // On évite le "Infinity" pour voir les changements
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});