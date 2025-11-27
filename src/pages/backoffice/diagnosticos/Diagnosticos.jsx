import { useState } from "react";
import BloquesPanel from "./BloquesPanel";
import ReservasPanel from "./ReservasPanel";


export default function Diagnosticos({ user }) {
  const [tab, setTab] = useState("bloques");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Gestor de Turnos (Diagnóstico)</h1>


      {tab === "bloques" && <BloquesPanel user={user}/>}
      {tab === "reservas" && <ReservasPanel />}
    </div>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border transition text-sm font-semibold
        ${active
          ? "bg-primary text-white border-primary"
          : "bg-white text-primary border-neutral-200 hover:bg-secondary-light"
        }`}
    >
      {children}
    </button>
  );
}
