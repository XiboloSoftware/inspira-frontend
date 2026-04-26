import { useEffect, useRef } from "react";

export default function CalculadoraMaster() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "scrollTop") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        src="/calculadora-master.html"
        title="Calculadora Máster Gratis — Inspira"
        className="w-full border-0"
        style={{ height: "calc(100vh - 60px)", minHeight: "600px" }}
      />
    </div>
  );
}
