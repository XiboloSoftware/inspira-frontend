import { useEffect, useState } from "react";
import { apiGET, apiPATCH } from "../../../services/api";

export default function DetalleSolicitudAdmin({ idSolicitud, volver }){

  const [solicitud,setSolicitud]=useState(null);

  const cargar= async()=>{
    const r= await apiGET(`/admin/solicitudes/${idSolicitud}`);
    if(r.ok) setSolicitud(r.solicitud);
  }

  useEffect(()=>{ cargar(); },[]);

  if(!solicitud) return "Cargando...";

  return (
    <div className="p-4 border rounded">
      <button onClick={volver}>← Volver</button>

      <h2>{solicitud.titulo}</h2>
      <p>Cliente: {solicitud.cliente.nombre}</p>

      <h3 className="font-bold mt-4">Documentos recibidos</h3>

      {solicitud.checklist.map(it=>(
        <div key={it.id_solicitud_item} className="p-2 border mt-1">
          <b>{it.item.nombre_item}</b>
          
          {it.documentos.length>0 ?
            it.documentos.map(doc=>(
              <div key={doc.id_documento}>
                <a href={`/api/admin/documentos/${doc.id_documento}/descargar`} target="_blank">
                  Descargar archivo
                </a>

                <select
                  defaultValue={doc.estado_revision}
                  onChange={e=> apiPATCH(`/admin/documentos/${doc.id_documento}/revision`,
                    {estado_revision:e.target.value}
                  )}
                >
                  <option value="SUBIDO">Pendiente</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="OBSERVADO">Observado</option>
                </select>
              </div>
            ))
          :"Sin archivo"}
        </div>
      ))}
    </div>
  )
}
