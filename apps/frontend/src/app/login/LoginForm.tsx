'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { loginAction, type AuthState } from '@/app/actions/auth';
import { loginSchema } from '@/lib/validations/auth';

const initialState: AuthState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      e.preventDefault();
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
    } else {
      setFieldErrors({});
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_4px_6px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.04)] p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-[10px] grid grid-cols-2 gap-[3px] p-[7px] flex-shrink-0"
            style={{ backgroundColor: '#0d9488' }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="block rounded-[3px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
              />
            ))}
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#1e293b] leading-tight tracking-[-0.02em]">
              NEXUS Cowork
            </p>
            <p className="text-[11px] text-[#94a3b8] uppercase tracking-[0.08em] leading-tight">
              Platform
            </p>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[24px] font-bold text-[#1e293b] tracking-[-0.02em] mb-1">
          Welcome back
        </h1>
        <p className="text-[14px] text-[#64748b] mb-8">
          Sign in to your account
        </p>

        <form action={formAction} onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-[#1e293b] mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
            />
            {fieldErrors.email && (
              <p className="text-[12px] text-[#dc2626] mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-[#1e293b] mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
            />
            {fieldErrors.password && (
              <p className="text-[12px] text-[#dc2626] mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* API error */}
          {state.error && (
            <p
              aria-live="polite"
              className="text-[13px] text-[#dc2626] bg-[#fee2e2] border border-[#fecaca] rounded-[8px] px-4 py-3 mb-4"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-sm py-[10px] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#64748b] mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#0d9488] hover:text-[#0f766e] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
