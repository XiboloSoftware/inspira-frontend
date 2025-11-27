import Hero from "./sections/Hero";
import ComoFunciona from "./sections/ComoFunciona";
import Servicios from "./sections/Servicios";
import CtaFinal from "./sections/CtaFinal";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <ComoFunciona />
      <Servicios />
      <CtaFinal />
    </div>
  );
}
