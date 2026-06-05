import { apiGet } from './api';
import type { EspaciosResponse, UserData } from '@/types';

// id -> nombre lookup from SpaceService. Any authenticated user may list spaces.
export async function getEspaciosMap(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  try {
    const res = await apiGet('/api/spaces/espacios?page=1&limit=100');
    if (res.ok) {
      const data: EspaciosResponse = await res.json();
      for (const e of data.espacios ?? []) map.set(e.id, e.nombre);
    }
  } catch {
    // fall back to "Espacio #id"
  }
  return map;
}

// id -> nombre lookup from AuthService. The /users endpoint is admin-only, so
// only call this when the current user is an admin (otherwise it 403s).
export async function getUsuariosMap(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  try {
    const res = await apiGet('/api/auth/users');
    if (res.ok) {
      const data: UserData[] = await res.json();
      for (const u of data ?? []) map.set(u.id, u.name);
    }
  } catch {
    // fall back to "Usuario #id"
  }
  return map;
}
