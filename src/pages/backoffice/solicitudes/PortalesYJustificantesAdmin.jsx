// src/pages/backoffice/solicitudes/PortalesYJustificantesAdmin.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import SeccionPortales from "./components/SeccionPortales";

export default function PortalesYJustificantesAdmin({ idSolicitud }) {
  const [ministerios, setMinisterios] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await boGET(`/api/portales/admin/solicitudes/${idSolicitud}`);
        if (!r.ok || cancelled) return;
        setMinisterios(r.ministerios || []);
        setMasters(r.masters || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-neutral-400 text-xs">
        <div className="w-4 h-4 border-2 border-[#023A4B] border-t-transparent rounded-full animate-spin" />
        Cargando portales y justificantes…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SeccionPortales
        titulo="7.1 Ministerios (nota media y homologación)"
        tipoPortal="MINISTERIO"
        items={ministerios}
        setItems={setMinisterios}
        idSolicitud={idSolicitud}
      />
      <SeccionPortales
        titulo="7.2 Universidades / Portales de máster"
        tipoPortal="UNIVERSIDAD"
        items={masters}
        setItems={setMasters}
        idSolicitud={idSolicitud}
      />
    </div>
  );
}
