import { useEffect, useState } from "react";

export function DriveIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}

export function DriveToast({ state }) {
  const visible = state !== "hidden";
  const isError = state === "error";
  return (
    <div
      className={`fixed top-5 left-1/2 z-[300] flex items-center gap-3 bg-white border shadow-2xl rounded-2xl px-5 py-3.5 transition-all duration-300 select-none pointer-events-none
        ${visible ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 -translate-y-3"}
        ${isError ? "border-red-200" : "border-neutral-200"}`}
    >
      <DriveIcon size={22} />
      <div>
        <p className={`text-sm font-semibold ${isError ? "text-red-700" : "text-neutral-800"}`}>
          {isError ? "No disponible en Drive" : "Abriendo en Drive…"}
        </p>
        <p className="text-xs text-neutral-400">
          {isError ? "El archivo puede no estar sincronizado aún" : "Se abrirá en una nueva pestaña"}
        </p>
      </div>
    </div>
  );
}

export function useDriveToast() {
  const [toastState, setToastState] = useState("hidden");

  useEffect(() => {
    let timer;
    const onOpen = () => {
      clearTimeout(timer);
      setToastState("opening");
      timer = setTimeout(() => setToastState("hidden"), 3000);
    };
    const onError = () => {
      clearTimeout(timer);
      setToastState("error");
      timer = setTimeout(() => setToastState("hidden"), 3000);
    };
    window.addEventListener("drive-opening", onOpen);
    window.addEventListener("drive-error", onError);
    return () => {
      window.removeEventListener("drive-opening", onOpen);
      window.removeEventListener("drive-error", onError);
      clearTimeout(timer);
    };
  }, []);

  return toastState;
}

export async function openDriveFolder(fetchFn) {
  window.dispatchEvent(new CustomEvent("drive-opening"));
  try {
    const r = await fetchFn();
    if (r.ok && r.url) window.open(r.url, "_blank");
    else window.dispatchEvent(new CustomEvent("drive-error"));
  } catch {
    window.dispatchEvent(new CustomEvent("drive-error"));
  }
}
