'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { registerAction, type AuthState } from '@/app/actions/auth';
import { registerSchema } from '@/lib/validations/auth';
import { usePhoneInput } from '@/hooks/usePhoneInput';

const initialState: AuthState = { error: null };

const COUNTRY_CODES = [
  { code: '+1', label: '+1 (US/CA)' },
  { code: '+33', label: '+33 (FR)' },
  { code: '+34', label: '+34 (ES)' },
  { code: '+39', label: '+39 (IT)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+49', label: '+49 (DE)' },
  { code: '+52', label: '+52 (MX)' },
  { code: '+54', label: '+54 (AR)' },
  { code: '+55', label: '+55 (BR)' },
  { code: '+57', label: '+57 (CO)' },
  { code: '+58', label: '+58 (VE)' },
  { code: '+81', label: '+81 (JP)' },
  { code: '+86', label: '+86 (CN)' },
];

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const phone = usePhoneInput();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      e.preventDefault();
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      });
      setFieldErrors(errors);
    } else {
      setFieldErrors({});
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-10">
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
          Create an account
        </h1>
        <p className="text-[14px] text-[#64748b] mb-8">
          Join NEXUS Cowork today
        </p>

        <form action={formAction} onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-[13px] font-medium text-[#1e293b] mb-1.5"
            >
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
            />
            {fieldErrors.name && (
              <p className="text-[12px] text-[#dc2626] mt-1">{fieldErrors.name}</p>
            )}
          </div>

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

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">
              Phone
            </label>
            <div className="flex gap-2">
              <select
                name="countryCode"
                defaultValue="+58"
                className="w-[130px] px-[10px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors"
              >
                {COUNTRY_CODES.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="300-1234567"
                value={phone.value}
                onChange={phone.onChange}
                className="flex-1 px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
              />
            </div>
            {fieldErrors.phoneNumber && (
              <p className="text-[12px] text-[#dc2626] mt-1">{fieldErrors.phoneNumber}</p>
            )}
            {fieldErrors.countryCode && (
              <p className="text-[12px] text-[#dc2626] mt-1">{fieldErrors.countryCode}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
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
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
            />
            {fieldErrors.password && (
              <p className="text-[12px] text-[#dc2626] mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-[13px] font-medium text-[#1e293b] mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-[12px] text-[#dc2626] mt-1">
                {fieldErrors.confirmPassword}
              </p>
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
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#64748b] mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#0d9488] hover:text-[#0f766e] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
