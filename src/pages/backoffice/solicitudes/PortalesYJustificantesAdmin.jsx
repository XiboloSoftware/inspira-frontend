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
      <section className="border border-neutral-200 rounded-lg p-3 mt-4 text-xs">
        Cargando portales y justificantes…
      </section>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-sm font-semibold text-neutral-900">7. Portales, claves y justificantes</h2>
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
