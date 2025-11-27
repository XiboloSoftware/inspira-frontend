// src/pages/diagnostico/Diagnostico.jsx
import { useEffect, useState } from "react";

import StepLoginGoogle from "./steps/StepLoginGoogle";
import StepHorario from "./steps/StepHorario";
import StepFormularioPrevio from "./steps/StepFormularioPrevio";
import StepPago from "./steps/StepPago";

export default function Diagnostico() {
  // 0 = pantalla de login/explicación
  // 1 = elegir horario
  // 2 = formulario previo
  // 3 = pago
  const [step, setStep] = useState(0);

  const [bloque, setBloque] = useState(null);
  const [comentario, setComentario] = useState("");

  // ¿hay token en localStorage?
  const [isLogged, setIsLogged] = useState(
    !!localStorage.getItem("token")
  );

  // Observa cambios en el token (por login/logout en otras pantallas)
  useEffect(() => {
    const interval = setInterval(() => {
      const hasToken = !!localStorage.getItem("token");
      setIsLogged(hasToken);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Cada vez que cambie isLogged, ajustamos el paso inicial
  useEffect(() => {
    if (isLogged) {
      // si está logueado y seguimos en paso 0, pasamos a elegir horario
      if (step === 0) setStep(1);
    } else {
      // sin login siempre vuelve a la pantalla de explicación
      setStep(0);
      setBloque(null);
    }
  }, [isLogged, step]);

  return (
    <div className="p-6">
      {/* Paso 0: SOLO si NO está logueado */}
      {!isLogged && (
        <StepLoginGoogle
          // por si en algún momento StepLoginGoogle quiere forzar pasar al siguiente paso
          onNext={() => {
            setIsLogged(true);
            setStep(1);
          }}
        />
      )}

      {/* Paso 1: Elegir fecha y horario */}
      {isLogged && step === 1 && (
        <StepHorario
          onSelectBloque={(b) => {
            setBloque(b);
            setStep(2);
          }}
          onBack={() => setStep(0)} // volver muestra de nuevo pantalla de login/explicación
        />
      )}

      {/* Paso 2: Comentarios previos */}
      {isLogged && step === 2 && (
        <StepFormularioPrevio
          comentario={comentario}
          setComentario={setComentario}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {/* Paso 3: Pago */}
      {isLogged && step === 3 && bloque && (
        <StepPago
          bloque={bloque}
          comentario={comentario}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}
