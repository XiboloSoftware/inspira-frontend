import HeroMaster from "./sections/HeroMaster";
import BeneficiosMaster from "./sections/BeneficiosMaster";
import EtapasMaster from "./sections/EtapasMaster";
import PlanesMaster from "./sections/PlanesMaster";
import TerminosMaster from "./sections/TerminosMaster";

export default function MasterLanding() {
  return (
    <div className="w-full">
      <HeroMaster />
      <BeneficiosMaster />
      <EtapasMaster />
      <PlanesMaster />
      <TerminosMaster />
    </div>
  );
}
