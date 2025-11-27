// src/pages/backoffice/diagnosticos/BloqueRow.jsx
import { useState } from "react";
import { boPUT, boDELETE } from "../../../services/backofficeApi";
import BloqueHeader from "./components/BloqueHeader";
import BloqueEditor from "./components/BloqueEditor";

export default function BloqueRow({ b, onUpdated, asesores = [], user }) {
  const [edit, setEdit] = useState(false);

  // estados locales que se editan
  const [hi, setHi] = useState(b.hora_inicio);
  const [hf, setHf] = useState(b.hora_fin);
  const [estado, setEstado] = useState(b.estado);
  const [idAsesor, setIdAsesor] = useState(b.id_usuario ?? "");

  // quién puede cambiar el trabajador asignado
  const puedeEditarAsesor = user?.rol === "admin";
  const asesorNombre = b.usuario ? b.usuario.nombre : "Sin asignar";

  async function guardar() {
    const payload = {
      hora_inicio: hi,
      hora_fin: hf,
      estado,
    };

    // Solo el ADMIN puede cambiar id_usuario
    if (puedeEditarAsesor) {
      payload.id_usuario = idAsesor === "" ? null : Number(idAsesor);
    }

    const r = await boPUT(
      `/backoffice/diagnosticos/bloques/${b.id_bloque}`,
      payload
    );

    if (!r.ok) {
      alert(r.msg || "No se pudo editar");
      return;
    }

    setEdit(false);
    onUpdated();
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este turno?")) return;

    const r = await boDELETE(
      `/backoffice/diagnosticos/bloques/${b.id_bloque}`
    );

    if (!r.ok) {
      alert(r.msg || "No se pudo eliminar");
      return;
    }

    onUpdated();
  }

  // puede liberar si tiene solo prereservas pendientes y nada pagado
  const puedeLiberar =
    b.pre_pendientes > 0 && !b.tiene_reservas && b.pre_pagadas === 0;

  async function liberar() {
    if (
      !confirm(
        "Esto cancelará las pre-reservas pendientes de este turno y lo dejará libre. ¿Continuar?"
      )
    )
      return;

    const r = await boPUT(
      `/backoffice/diagnosticos/bloques/${b.id_bloque}/liberar`
    );

    if (!r.ok) {
      alert(r.msg || "No se pudo liberar el turno");
      return;
    }

    setEdit(false);
    onUpdated();
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-3 shadow-sm">
      <BloqueHeader
        bloque={b}
        onEditar={() => setEdit(true)}
        onEliminar={eliminar}
      />

      {edit && (
        <BloqueEditor
          hi={hi}
          hf={hf}
          estado={estado}
          idAsesor={idAsesor}
          asesores={asesores}
          asesorNombre={asesorNombre}
          puedeEditarAsesor={puedeEditarAsesor}
          setHi={setHi}
          setHf={setHf}
          setEstado={setEstado}
          setIdAsesor={setIdAsesor}
          onGuardar={guardar}
          onCancelar={() => setEdit(false)}
          puedeLiberar={puedeLiberar}
          onLiberar={liberar}
        />
      )}
    </div>
  );
}
