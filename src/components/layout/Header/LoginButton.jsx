// src/components/layout/header/LoginButton.jsx
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

function handleLoginClick() {
  const current =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  localStorage.setItem("post_login_redirect", current || "/");
  window.location.href = `${API_URL}/auth/google`;
}


export default function LoginButton() {
  return (
    <button
      type="button"
      onClick={handleLoginClick}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
    >
      Iniciar con Google
    </button>
  );
  
}




