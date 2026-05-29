import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// For multipart/form-data uploads: do NOT set Content-Type so fetch can
// add the correct multipart boundary. Only the Authorization header is sent.
async function getAuthHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';
  return { Authorization: `Bearer ${token}` };
}

export async function apiGet(path: string) {
  return fetch(`${API_URL}${path}`, {
    headers: await getHeaders(),
    cache: 'no-store',
  });
}

export async function apiPost<T>(path: string, body: T) {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(path: string, body: T) {
  return fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: await getHeaders(),
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(path: string, body?: T) {
  return fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPostForm(path: string, formData: FormData) {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: await getAuthHeader(),
    body: formData,
  });
}

export async function apiPutForm(path: string, formData: FormData) {
  return fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: await getAuthHeader(),
    body: formData,
  });
}

export async function apiDelete(path: string) {
  return fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
}
