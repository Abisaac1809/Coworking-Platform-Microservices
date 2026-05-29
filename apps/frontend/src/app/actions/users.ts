'use server';

import { apiGet, apiPost, apiDelete, apiPut } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import type { CreateUserPayload, UpdateProfilePayload } from '@/types';

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string
  role: string
  created_at: string
  updated_at: string
}

export async function fetchAdmins(): Promise<AdminUser[]> {
  try {
    const res = await apiGet('/api/auth/users/admins');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export type UserActionState = { error: string | null; success?: boolean }

export async function createAdminAction(
  _state: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const countryCode = formData.get('countryCode') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const password = formData.get('password') as string;

  const phone = `${countryCode} ${phoneNumber}`;

  let res: Response;
  try {
    res = await apiPost<CreateUserPayload>('/api/auth/users/admin', { name, email, phone, password, role: 'Admin' });
  } catch {
    return { error: 'Unable to reach the server.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: typeof body?.detail === 'string' ? body.detail : 'Failed to create user.' };
  }

  revalidatePath('/users');
  return { error: null, success: true };
}

export async function deleteUserAction(id: number): Promise<UserActionState> {
  let res: Response;
  try {
    res = await apiDelete(`/api/auth/users/${id}`);
  } catch {
    return { error: 'Unable to reach the server.' };
  }

  if (!res.ok && res.status !== 204) {
    return { error: 'Failed to delete user.' };
  }

  revalidatePath('/users');
  return { error: null, success: true };
}

export async function updateProfileAction(
  _state: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const countryCode = formData.get('countryCode') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const password = formData.get('password') as string | null;

  const phone = `${countryCode} ${phoneNumber}`;
  const body: UpdateProfilePayload = { name, email, phone };
  if (password) body.password = password;

  let res: Response;
  try {
    res = await apiPut<UpdateProfilePayload>('/api/auth/users/me', body);
  } catch {
    return { error: 'Unable to reach the server.' };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: typeof data?.detail === 'string' ? data.detail : 'Update failed.' };
  }

  revalidatePath('/profile');
  return { error: null, success: true };
}
