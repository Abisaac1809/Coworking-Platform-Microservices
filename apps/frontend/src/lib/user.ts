import { cookies } from 'next/headers';

export interface AppUser {
  id: number
  name: string
  email: string
  role: 'User' | 'Admin'
}

export async function getUserFromCookies(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('user')?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}
