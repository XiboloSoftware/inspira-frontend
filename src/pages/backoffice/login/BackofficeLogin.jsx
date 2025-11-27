// src/pages/backoffice/login/BackofficeLogin.jsx
import { useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";

export default function BackofficeLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    const r = await boPOST("/backoffice/auth/login", { email, password });

    setLoading(false);

    if (!r.ok) {
      alert(r.msg || "Credenciales inválidas");
      return;
    }

    // AQUÍ ES LO QUE FALTABA:
    // guardar el token para que backofficeApi lo mande en Authorization
    localStorage.setItem("bo_token", r.token);
    localStorage.setItem("bo_user", JSON.stringify(r.user));

    if (onLogin) onLogin(r.user);

    // Redirigir a la pantalla principal del backoffice
    navigate("/backoffice/diagnosticos");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-primary mb-6">
          Acceso backoffice
        </h1>

        <label className="block text-sm text-neutral-700 mb-1">Email</label>
        <input
          type="email"
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm text-neutral-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
