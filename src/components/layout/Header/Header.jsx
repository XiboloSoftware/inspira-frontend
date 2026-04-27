import { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import { navItems } from "./header.data";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import LoginButton from "./LoginButton";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      <header
        className={`w-full fixed top-0 left-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-200"
            : "bg-white border-b border-neutral-100"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <a href="/" onClick={(e) => go(e, "/")} className="flex-shrink-0">
            <img src={logo} alt="Inspira" className="h-8 w-auto object-contain" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.badge) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90 hover:scale-105"
                    style={{ background: "#1D6A4A" }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" />
                    </span>
                    {item.label}
                  </a>
                );
              }
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.highlight
                      ? "text-accent hover:text-accent-dark hover:bg-orange-50"
                      : "text-neutral-700 hover:text-primary hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right: CTA + Login */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/diagnostico"
              onClick={(e) => go(e, "/diagnostico")}
              className="bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
            >
              Reserva Diagnóstico 25€
            </a>
            {!user && <LoginButton />}
            {user && <UserMenu user={user} />}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h16M3 12h16M3 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
