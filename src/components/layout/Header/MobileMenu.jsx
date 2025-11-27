// src/components/layout/Header/MobileMenu.jsx
import { useAuth } from "../../../context/AuthContext";
import MobileMenuHeader from "./MobileMenuHeader";
import MobileMenuCTA from "./MobileMenuCTA";
import MobileMenuNavLinks from "./MobileMenuNavLinks";
import MobileMenuUserSection from "./MobileMenuUserSection";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

function getCurrentPath() {
  return (
    window.location.pathname +
    window.location.search +
    window.location.hash
  );
}

export default function MobileMenu({ open, onClose }) {
  const { user, logout } = useAuth();

  if (!open) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleLogin = () => {
    const current = getCurrentPath();
    localStorage.setItem("post_login_redirect", current || "/");
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-5 flex flex-col gap-4">
        <MobileMenuHeader onClose={onClose} />

        <MobileMenuCTA />

        <MobileMenuNavLinks onClose={onClose} />

        <MobileMenuUserSection
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
