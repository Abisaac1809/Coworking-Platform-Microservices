'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeJwt } from 'jose';
import type { AuthResponse } from '@/types';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export type AuthState = { error: string | null }

function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  data: AuthResponse,
) {
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });

  let id: number = data.user?.id;
  let name: string = data.user?.name;
  let email: string = data.user?.email;
  let role: string = data.user?.role;

  if (!id) {
    try {
      const payload = decodeJwt(data.access_token);
      id = Number(payload.sub);
      name = (payload.name as string) ?? name;
      email = (payload.email as string) ?? email;
      role = (payload.role as string) ?? role;
    } catch {
    }
  }

  cookieStore.set(
    'user',
    JSON.stringify({ id, name, email, role }),
    { path: '/', sameSite: 'lax' },
  );
}

export async function loginAction(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: 'Unable to reach the server. Please try again.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : 'Invalid credentials. Please try again.';
    return { error: message };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  setAuthCookies(cookieStore, data);

  redirect('/dashboard');
}

export async function registerAction(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const countryCode = formData.get('countryCode') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const password = formData.get('password') as string;

  const phone = `${countryCode} ${phoneNumber}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role: 'User' }),
    });
  } catch {
    return { error: 'Unable to reach the server. Please try again.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : 'Registration failed. Please try again.';
    return { error: message };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  setAuthCookies(cookieStore, data);

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
  redirect('/login');
}
