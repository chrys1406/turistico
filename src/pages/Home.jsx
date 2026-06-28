import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Compass, Mountain, ArrowRight, Star, Clock, Map } from "lucide-react";
import { getDestinos, getRutas } from "../services/api";

import mirador from "../assets/fondo/Mirador.png";
import teleferico from "../assets/fondo/teleferico.jpg";
import feria from "../assets/fondo/feria.jpeg";
import valle from "../assets/fondo/valle-de-la-luna.jpg";
import titicaca from "../assets/fondo/lago-titicaca.jpg";
import coroico from "../assets/fondo/coroico.jpg";

const IMGS = { mirador, teleferico, feria, valle, titicaca, coroico };

function Img({ src, alt, className, style }) {
  const [err, setErr] = useState(false);
  return err ? (
    <div
      className={`${className} flex flex-col items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400`}
      style={style}
    >
      <Mountain size={28} className="mb-2 opacity-40" />
      <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{alt}</span>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} />
  );
}

export default function Home() {
  const [activeRuta, setActiveRuta] = useState(0);
  const [totalDestinos, setTotalDestinos] = useState(null);
  const [rutas, setRutas] = useState([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    getDestinos()
      .then((data) => setTotalDestinos(data.length))
      .catch(() => setTotalDestinos(null));
  }, []);

  useEffect(() => {
    getRutas()
      .then((data) => setRutas(data))
      .catch(() => setRutas([]));
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8f9fa", color: "#1a1a2e" }}>
      <section className="max-w-[1440px] mx-auto bg-white min-h-screen">

        {/* ── HERO MOBILE ── solo visible en móvil */}
        <div className="lg:hidden pt-20 px-4 pb-6">
          <p className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-slate-400 inline-block" />
            Encuentros Auténticos
          </p>
          <h1
            className="text-4xl font-light text-slate-900 tracking-tight leading-none mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            DESCUBRE<br />
            <strong className="font-black">LA PAZ</strong><br />
            <span className="font-light text-slate-400">BOLIVIA</span>
          </h1>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            Historia, cultura y naturaleza en la capital más alta del mundo, a 3.640 metros sobre el nivel del mar.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              to="/destinos"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-semibold active:scale-95 transition-all"
            >
              <Compass size={15} /> Explorar
            </Link>
            <Link
              to="/mapa"
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-semibold active:scale-95 transition-all"
            >
              <Map size={15} /> Ver Mapa
            </Link>
          </div>

          {/* Foto hero móvil */}
          <div className="relative rounded-2xl overflow-hidden mt-5" style={{ height: '220px' }}>
            <Img
              src={IMGS.mirador}
              alt="Vista panorámica La Paz"
              className="w-full h-full object-cover absolute inset-0"
              style={{}}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-white font-bold text-sm">Vista Panorámica</span>
              <p className="text-white/70 text-xs">La Paz desde El Alto</p>
            </div>
          </div>

          {/* Cards móvil: teleférico + feria */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="relative rounded-xl overflow-hidden" style={{ height: '140px' }}>
              <Img src={IMGS.teleferico} alt="Teleférico" className="w-full h-full object-cover absolute inset-0" style={{}} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="inline-block bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mb-1">Icónico</span>
                <p className="text-white font-bold text-xs">Mi Teleférico</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative flex-1" style={{ height: '90px' }}>
                <Img src={IMGS.feria} alt="Feria de El Alto" className="w-full h-full object-cover absolute inset-0" style={{}} />
              </div>
              <div className="p-2.5">
                <span className="text-[9px] font-bold text-amber-600 uppercase">Cultural</span>
                <p className="font-bold text-xs text-slate-900">Feria de El Alto</p>
              </div>
            </div>
          </div>

          {/* 3 cards móvil */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { img: IMGS.valle, tag: "Naturaleza", nombre: "Valle Luna", rating: 4.8 },
              { img: IMGS.titicaca, tag: "Lago", nombre: "Titicaca", rating: 4.9 },
              { img: IMGS.coroico, tag: "Aventura", nombre: "Coroico", rating: 4.8 },
            ].map((d, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative overflow-hidden" style={{ height: '80px' }}>
                  <Img src={d.img} alt={d.nombre} className="w-full h-full object-cover absolute inset-0" style={{}} />
                  <span className="absolute top-1.5 left-1.5 bg-white/90 text-slate-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    {d.tag}
                  </span>
                </div>
                <div className="p-2">
                  <p className="font-bold text-[11px] text-slate-900 leading-tight">{d.nombre}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={9} fill="#f59e0b" color="#f59e0b" />
                    <span className="text-[10px] font-bold text-slate-700">{d.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── GRID PRINCIPAL DESKTOP ── oculto en móvil */}
        <div className="hidden lg:grid px-12 pt-28 pb-10 grid-cols-12 gap-6">
          {/* Columna izquierda */}
          <div className="col-span-4 flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase flex items-center gap-2 mb-4">
                <span className="w-6 h-px bg-slate-400 inline-block" />
                Encuentros Auténticos
              </p>
              <h1
                className="text-7xl font-light text-slate-900 tracking-tight leading-none mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                DESCUBRE<br />
                <strong className="font-black">LA PAZ</strong><br />
                <span className="font-light text-slate-400">BOLIVIA</span>
              </h1>
              <p className="text-slate-500 mt-4 text-sm leading-relaxed max-w-xs">
                Historia, cultura y naturaleza en la capital más alta del mundo, a 3.640 metros sobre el nivel del mar.
              </p>
              <div className="flex gap-3 mt-8">
                <Link
                  to="/destinos"
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all hover:shadow-lg"
                >
                  <Compass size={15} /> Explorar
                </Link>
                <Link
                  to="/mapa"
                  className="flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all hover:border-slate-400"
                >
                  <Map size={15} /> Ver Mapa
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[280px]">
              <Img src={IMGS.mirador} alt="Vista panorámica La Paz" className="w-full h-full object-cover absolute inset-0" style={{ minHeight: "280px" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-white font-bold text-sm">Vista Panorámica</span>
                <p className="text-white/70 text-xs">La Paz desde El Alto</p>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 relative rounded-2xl overflow-hidden" style={{ minHeight: "340px" }}>
                <Img src={IMGS.teleferico} alt="Teleférico e Illimani" className="w-full h-full object-cover absolute inset-0" style={{ minHeight: "340px" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="inline-block bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2">Icónico</span>
                  <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Teleférico & Illimani</h3>
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1"><MapPin size={10} /> Vista desde las alturas</p>
                </div>
              </div>
              <div className="col-span-4 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative" style={{ minHeight: "220px", flex: 1 }}>
                  <Img src={IMGS.feria} alt="Feria de El Alto" className="w-full h-full object-cover absolute inset-0" style={{ minHeight: "220px" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cultural</span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">Feria de El Alto</h3>
                  <p className="text-xs text-slate-500 mt-1">Cultura y tradición viva</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={11} fill="#f59e0b" color="#f59e0b" />
                    <span className="text-xs font-bold text-slate-700">4.7</span>
                    <span className="text-xs text-slate-400 ml-1">· 2 horas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { img: IMGS.valle, tag: "Naturaleza", nombre: "Valle de la Luna", sub: "Paisajes de Otro Mundo", rating: 4.8, tiempo: "3h" },
                { img: IMGS.titicaca, tag: "Lago", nombre: "Lago Titicaca", sub: "Espejo del Cielo", rating: 4.9, tiempo: "Día" },
                { img: IMGS.coroico, tag: "Aventura", nombre: "Coroico", sub: "Los Yungas Bolivianos", rating: 4.8, tiempo: "Día" },
              ].map((d, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col">
                  <div className="relative overflow-hidden" style={{ height: "200px" }}>
                    <Img src={d.img} alt={d.nombre} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500" style={{ height: "200px" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{d.tag}</span>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-sm text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>{d.nombre}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{d.sub}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        <span className="font-bold text-slate-700">{d.rating}</span>
                      </div>
                      <div className="flex items-center gap-1"><Clock size={11} /> {d.tiempo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="mx-4 md:mx-12 border-t border-slate-100 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
          {[
            { valor: totalDestinos !== null ? `${totalDestinos}` : "...", label: "Destinos" },
            { valor: "12", label: "Rutas" },
            { valor: "3.640m", label: "Altitud" },
            { valor: "3M+", label: "Visitantes" },
          ].map((s, i) => (
            <div key={i} className="bg-white text-center py-6 md:py-8 px-4">
              <div className="text-2xl md:text-3xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.valor}
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── RUTAS ── */}
        <div className="px-4 md:px-12 py-12 md:py-20">
          <div className="mb-8 md:mb-10">
            <p className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase mb-2">Recorridos recomendados</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Rutas <span className="text-amber-500">Turísticas</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
            {rutas.map((r, i) => {
              const emojis = ["🏛️", "🌿", "🏔️", "🚵", "⛰️"];
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRuta(i)}
                  className="text-left p-5 md:p-6 rounded-2xl border transition-all duration-300 active:scale-95"
                  style={{
                    background: activeRuta === i ? "#1a1a2e" : "#fff",
                    borderColor: activeRuta === i ? "#1a1a2e" : "#e2e8f0",
                    color: activeRuta === i ? "#fff" : "#1a1a2e",
                  }}
                >
                  <div className="text-2xl md:text-3xl mb-3 md:mb-4">{emojis[i % emojis.length]}</div>
                  <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {r.nombre}
                  </h3>
                  <div className="space-y-2 text-xs md:text-sm" style={{ color: activeRuta === i ? "rgba(255,255,255,0.6)" : "#64748b" }}>
                    <div className="flex justify-between">
                      <span>Paradas</span>
                      <span style={{ color: activeRuta === i ? "#fff" : "#1a1a2e", fontWeight: 700 }}>{r.num_paradas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración</span>
                      <span style={{ color: activeRuta === i ? "#fff" : "#1a1a2e", fontWeight: 700 }}>{r.duracion_estimada}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dificultad</span>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>{r.dificultad}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* ── CTA FINAL ── */}
        <div className="mx-4 md:mx-12 mb-8 md:mb-12 rounded-2xl md:rounded-3xl overflow-hidden relative" style={{ minHeight: "250px" }}>
          <Img src={IMGS.mirador} alt="La Paz" className="w-full h-full object-cover absolute inset-0" style={{ minHeight: "250px" }} />
          <div className="absolute inset-0 bg-slate-900/70" />
          <div className="relative z-10 px-6 py-12 md:p-12 text-center flex flex-col items-center justify-center" style={{ minHeight: "250px" }}>
            <p className="text-xs font-bold tracking-[0.3em] text-amber-400 uppercase mb-3">Tu aventura comienza aquí</p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-5 md:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              ¿Listo para explorar<br />La Paz?
            </h2>
            <Link
              to="/mapa"
              className="inline-flex items-center gap-2 md:gap-3 bg-white text-slate-900 font-bold px-6 md:px-10 py-3 md:py-4 rounded-xl text-sm md:text-base transition-all active:scale-95"
            >
              <Mountain size={16} /> Abrir Mapa Interactivo <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}