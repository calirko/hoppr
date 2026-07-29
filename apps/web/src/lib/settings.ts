import { useEffect, useState } from 'react';

const AUTO_COPY_PASSWORD_KEY = 'hoppr_auto_copy_password';

export function getAutoCopyPassword(): boolean {
  return localStorage.getItem(AUTO_COPY_PASSWORD_KEY) === 'true';
}

export function setAutoCopyPassword(value: boolean) {
  localStorage.setItem(AUTO_COPY_PASSWORD_KEY, String(value));
}

export function useAutoCopyPassword() {
  const [autoCopyPassword, setState] = useState<boolean>(() =>
    getAutoCopyPassword(),
  );

  useEffect(() => {
    setAutoCopyPassword(autoCopyPassword);
  }, [autoCopyPassword]);

  return { autoCopyPassword, setAutoCopyPassword: setState };
}
