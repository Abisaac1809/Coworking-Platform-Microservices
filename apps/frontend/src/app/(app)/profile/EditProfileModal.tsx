'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import ProfileForm from './ProfileForm';

interface EditProfileModalProps {
  name: string
  email: string
  phone: string
  role: string
}

export default function EditProfileModal({ name, email, phone, role }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-4 p-2 rounded-[8px] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b] transition-colors"
        aria-label="Editar perfil"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Editar Perfil">
        <ProfileForm
          name={name}
          email={email}
          phone={phone}
          role={role}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
