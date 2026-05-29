'use client';

import { useState, useActionState, useEffect } from 'react';
import { createAdminAction, type UserActionState } from '@/app/actions/users';
import Modal from '@/components/Modal';
import { usePhoneInput } from '@/hooks/usePhoneInput';

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

const init: UserActionState = { error: null };

export default function CreateAdminModal() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createAdminAction, init);
  const phone = usePhoneInput();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#0d9488] text-white text-sm font-medium px-5 py-[10px] rounded-[8px] hover:bg-[#0f766e] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Admin
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Admin User">
        <form action={action} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Full name</label>
            <input name="name" type="text" required placeholder="Jane Doe" className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Email</label>
            <input name="email" type="email" required placeholder="admin@example.com" className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Phone</label>
            <div className="flex gap-2">
              <select name="countryCode" defaultValue="+58" className="w-[130px] px-[10px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors">
                {COUNTRY_CODES.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <input name="phoneNumber" type="tel" required placeholder="300-1234567" value={phone.value} onChange={phone.onChange} className="flex-1 px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Password</label>
            <input name="password" type="password" required placeholder="••••••••" className="w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors" />
          </div>
          {state.error && (
            <p className="text-[13px] text-[#dc2626] bg-[#fee2e2] border border-[#fecaca] rounded-[8px] px-4 py-3">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-sm py-[10px] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {pending ? 'Creating…' : 'Create Admin User'}
          </button>
        </form>
      </Modal>
    </>
  );
}
