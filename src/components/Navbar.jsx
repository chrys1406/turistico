import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Map, Compass, Mountain, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menu al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const links = [
    { to: "/", label: "Inicio", icon: <Mountain size={15} /> },
    { to: "/destinos", label: "Destinos", icon: <Compass size={15} /> },
    { to: "/mapa", label: "Mapa", icon: <Map size={15} /> },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 transition-all duration-300"
      style={{
        zIndex: 10000,
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#1a1a2e" }}
          >
            <Mountain size={15} color="white" />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-xs md:text-sm font-black tracking-widest uppercase"
              style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', serif" }}
            >
              La Paz
            </span>
            <span className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-semibold text-slate-400">
              Rutas Turísticas
            </span>
          </div>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: location.pathname === to ? "#1a1a2e" : "transparent",
                color: location.pathname === to ? "#fff" : "#475569",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== to) {
                  e.currentTarget.style.background = "#f1f5f9"
                  e.currentTarget.style.color = "#1a1a2e"
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== to) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#475569"
                }
              }}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>

        {/* Botón Ver Mapa desktop */}
        <div className="hidden md:block">
          <Link
            to="/mapa"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(245,158,11,0.25)",
            }}
          >
            <Map size={14} />
            Ver Mapa
          </Link>
        </div>

        {/* Botón móvil */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: "#1a1a2e" }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú móvil — animado */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 flex flex-col gap-1 border-t"
          style={{ background: "rgba(255,255,255,0.99)", borderColor: "#e2e8f0" }}
        >
          {links.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: location.pathname === to ? "#1a1a2e" : "transparent",
                color: location.pathname === to ? "#fff" : "#475569",
              }}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}