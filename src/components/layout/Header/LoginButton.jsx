// src/components/layout/header/LoginButton.jsx
const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export default function LoginButton() {
  return (
    <a
      href={`${API_URL}/auth/google`}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
    >
      Iniciar con Google
    </a>
  );
}
