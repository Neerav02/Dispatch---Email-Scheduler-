const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dispatch-api-o2bf.onrender.com/api';

// Token management for cross-domain auth (Vercel frontend <-> Render backend)
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dispatch_token');
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dispatch_token', token);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dispatch_token');
    localStorage.removeItem('dispatch_demo_mode');
  }
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('dispatch_demo_mode') === 'true';
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isDemo) {
    headers['X-Demo-Mode'] = 'true';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `HTTP ${response.status} error`;
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.code = data?.error?.code || 'API_ERROR';
    throw error;
  }

  return data;
}

export { API_BASE_URL };
