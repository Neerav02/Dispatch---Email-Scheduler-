const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('dispatch_demo_mode') === 'true';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (isDemo) {
    headers['X-Demo-Mode'] = 'true';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
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
