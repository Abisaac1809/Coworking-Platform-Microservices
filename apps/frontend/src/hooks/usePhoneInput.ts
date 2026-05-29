'use client';

import { useState } from 'react';

function format(digits: string): string {
  const d = digits.slice(0, 10);
  return d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
}

export function usePhoneInput(initial = '') {
  const digits = initial.replace(/\D/g, '').slice(0, 10);
  const [value, setValue] = useState(format(digits));

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue(format(onlyDigits));
  }

  return { value, onChange };
}
