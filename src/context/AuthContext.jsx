// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Si NO hay token, no tiene sentido llamar /auth/me
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetchMe();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // aunque falle backend, igual limpiamos front
    } finally {
      // ✅ CLAVE: borrar token y datos locales
      localStorage.removeItem("token");
      localStorage.removeItem("last_pre_reserva_id");
      localStorage.removeItem("user");

      setUser(null);

      // ✅ vuelve al flujo de diagnóstico (paso login)
      window.location.href = "/diagnostico";

    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
