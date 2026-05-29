'use client';

import { useActionState } from 'react';
import { updateProfileAction, type UserActionState } from '@/app/actions/users';
import { usePhoneInput } from '@/hooks/usePhoneInput';
import type { PhoneParts } from '@/types';

const COUNTRY_CODES = [
  { code: '+1', label: '+1' },
  { code: '+33', label: '+33' },
  { code: '+34', label: '+34' },
  { code: '+39', label: '+39' },
  { code: '+44', label: '+44' },
  { code: '+49', label: '+49' },
  { code: '+52', label: '+52' },
  { code: '+54', label: '+54' },
  { code: '+55', label: '+55' },
  { code: '+57', label: '+57' },
  { code: '+58', label: '+58' },
  { code: '+81', label: '+81' },
  { code: '+86', label: '+86' },
];

interface ProfileFormProps {
  name: string
  email: string
  phone: string
  role: string
  onSuccess?: () => void
}

function parsePhone(phone: string): PhoneParts {
  const match = phone.match(/^(\+\d{2}) (.+)$/);
  return match ? { code: match[1], number: match[2] } : { code: '+58', number: phone };
}

const init: UserActionState = { error: null };

export default function ProfileForm({ name, email, phone, role, onSuccess }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, init);
  const { code, number } = parsePhone(phone);
  const phoneInput = usePhoneInput(number);

  if (state.success) onSuccess?.();

  return (
    <form action={action} className="space-y-5">
      {state.success && (
        <p className="text-[13px] text-[#16a34a] bg-[#dcfce7] border border-[#bbf7d0] rounded-[8px] px-4 py-3">
          Profile updated successfully.
        </p>
      )}
      {state.error && (
        <p className="text-[13px] text-[#dc2626] bg-[#fee2e2] border border-[#fecaca] rounded-[8px] px-4 py-3">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Full name</label>
        <input
          name="name"
          type="text"
          defaultValue={name}
          required
          className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] focus:outline-none focus:border-[#0d9488] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] focus:outline-none focus:border-[#0d9488] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Phone</label>
        <div className="flex gap-2">
          <select
            name="countryCode"
            defaultValue={code}
            className="w-[90px] px-[10px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors"
          >
            {COUNTRY_CODES.map(({ code: c, label }) => (
              <option key={c} value={c}>{label}</option>
            ))}
          </select>
          <input
            name="phoneNumber"
            type="tel"
            required
            placeholder="300-1234567"
            value={phoneInput.value}
            onChange={phoneInput.onChange}
            className="flex-1 px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">
          New password <span className="text-[#94a3b8] font-normal">(leave blank to keep current)</span>
        </label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-sm py-[10px] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
