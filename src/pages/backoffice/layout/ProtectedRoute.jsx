import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

export default function ProtectedRoute({ children, onLogout }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    async function check() {
      const r = await boGET("/backoffice/me");
      setOk(r.ok);
      if (!r.ok) onLogout?.();
    }
    check();
  }, []);

  if (ok === null) return <div className="p-6 text-neutral-700">Cargando...</div>;
  if (!ok) return null;

  return children;
}
