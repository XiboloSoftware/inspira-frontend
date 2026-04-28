// src/components/layout/Header/MobileMenuCTA.jsx
import { navigate } from "../../../services/navigate";

export default function MobileMenuCTA() {
  return (
    <a
      href="/servicios/master"
      onClick={(e) => { e.preventDefault(); navigate("/servicios/master"); }}
      className="w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
    >
      Ver Programa Máster 360°
    </a>
  );
}
