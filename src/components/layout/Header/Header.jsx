import { useState } from "react";
import TopBar from "./TopBar";
import MainNav from "./MainNav";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full border-b border-neutral-200 bg-white">

      <TopBar onOpenMenu={() => setMobileOpen(true)} />
      <MainNav />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
