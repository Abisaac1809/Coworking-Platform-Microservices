import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Crear cuenta — NEXUS Cowork',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
