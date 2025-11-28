// src/components/layout/Header/LoginButton.jsx
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const loginGoogle = () => {
  // Ruta actual (incluye query y hash, por si acaso)
  const currentPath =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  // Evitar guardar rutas raras como /auth/success
  const safePath =
    !currentPath || currentPath === "/auth/success" ? "/" : currentPath;

  // Guardar a dónde queremos volver después del login
  localStorage.setItem("post_login_redirect", safePath);

  // Ir al backend para hacer el login con Google
  window.location.href = `${API_URL}/auth/google`;
};

export default function LoginButton() {
  return (
    <button
      type="button"
      onClick={loginGoogle}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
    >
      Iniciar con Google
    </button>
  );
}
