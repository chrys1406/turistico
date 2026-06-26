import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Navigation,
  Share2,
  Heart,
  ChevronRight,
  Loader2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  getDestino,
  getServiciosCercanos,
  getFotos,
  calcularDistancia,
} from "../services/api";
import SubirFoto from "../components/SubirFoto";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function Img({ src, alt, className, style }) {
  const [err, setErr] = useState(false);
  return !src || err ? (
    <div
      className={`${className} flex items-center justify-center bg-slate-100`}
      style={style}
    >
      <MapPin size={32} className="text-slate-300" />
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErr(true)}
    />
  );
}

export default function DetalleDestino() {
  const { id } = useParams();
  const [favorito, setFavorito] = useState(false);
  const [destino, setDestino] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [distancia, setDistancia] = useState(null);
  const [elevacion, setElevacion] = useState(null);
  const [clima, setClima] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCargando(true);
    setError(null);
    getDestino(id)
      .then((data) => setDestino(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);
  useEffect(() => {
    getServiciosCercanos(id)
      .then((data) => setServicios(data))
      .catch(() => setServicios([]));
  }, [id]);

  useEffect(() => {
    getFotos(id)
      .then((data) => setFotos(data))
      .catch(() => setFotos([]));
  }, [id]);

  useEffect(() => {
    if (!destino) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        calcularDistancia(pos.coords.latitude, pos.coords.longitude, destino.id)
          .then((data) => setDistancia(data))
          .catch(() => setDistancia(null));
      },
      () => setDistancia(null),
    );
  }, [destino]);

  useEffect(() => {
    if (!destino) return;
    fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${destino.lat},${destino.lng}`,
    )
      .then((r) => r.json())
      .then((data) => setElevacion(data.results[0].elevation))
      .catch(() => setElevacion(null));
  }, [destino]);

  useEffect(() => {
    if (!destino) return;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${destino.lat}&longitude=${destino.lng}&current=temperature_2m,weathercode&timezone=America%2FLa_Paz`,
    )
      .then((r) => r.json())
      .then((data) => setClima(data.current))
      .catch(() => setClima(null));
  }, [destino]);

  if (cargando) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8f9fa" }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: "#f59e0b" }}
          />
          <p className="text-sm font-medium">Cargando destino...</p>
        </div>
      </div>
    );
  }

  if (error || !destino) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8f9fa" }}
      >
        <div className="text-center">
          <p className="text-red-500 font-bold mb-2">Destino no encontrado</p>
          <p className="text-slate-400 text-sm mb-4">
            ¿Está corriendo el backend Flask?
          </p>
          <Link to="/destinos" className="text-amber-500 font-bold">
            ← Volver a destinos
          </Link>
        </div>
      </div>
    );
  }

  const emojiClima = (code) => {
    if (code === 0) return "☀️";
    if (code <= 2) return "⛅";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  };

  const color = destino.categoria_color || "#f59e0b";
  const coords = [destino.lat, destino.lng];

  const iconoPersonalizado = L.divIcon({
    className: "",
    html: `
      <div style="
        width:40px; height:40px;
        background:${color};
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 14px rgba(0,0,0,0.3);
      ">
        <div style="
          width:12px; height:12px;
          background:white; border-radius:50%;
          position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%) rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* ── HERO CON IMAGEN ── */}
      <div
        className="relative h-[55vh] min-h-[400px] overflow-hidden"
        style={{ background: "#1e293b" }}
      >
        <Img
          src={destino.imagen_url}
          alt={destino.nombre}
          className="w-full h-full object-cover"
          style={{}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />

        <div className="absolute top-24 left-6 right-6 flex items-center justify-between">
          <Link
            to="/destinos"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all hover:-translate-x-1"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ArrowLeft size={15} /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavorito(!favorito)}
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Heart
                size={16}
                fill={favorito ? "#ef4444" : "none"}
                color={favorito ? "#ef4444" : "#fff"}
              />
            </button>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Share2 size={16} color="#fff" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: color, color: "#fff" }}
            >
              {destino.categoria}
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {destino.nombre}
          </h1>
          <div className="flex items-center gap-4 text-sm text-white/70 flex-wrap">
            <span className="flex items-center gap-1">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <strong className="text-white">{destino.rating}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {destino.tiempo_visita}
            </span>
            {elevacion && (
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                ⛰️ {elevacion.toLocaleString()} msnm
              </span>
            )}

            {clima && (
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                {emojiClima(clima.weathercode)} {clima.temperature_2m}°C
              </span>
            )}

            {distancia && (
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(245,158,11,0.25)",
                  color: "#f59e0b",
                }}
              >
                <MapPin size={12} /> {distancia.distancia_km} km de ti
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div
              className="bg-white rounded-2xl p-8"
              style={{ border: "1px solid #f1f5f9" }}
            >
              <h2
                className="text-2xl font-black text-slate-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Sobre este lugar
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                {destino.descripcion}
              </p>
              <p className="text-slate-500 leading-relaxed text-sm">
                {destino.descripcion_detalle}
              </p>
            </div>

            {/* Mapa mini */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: "1px solid #f1f5f9" }}
            >
              <div className="p-6 pb-0">
                <h2
                  className="text-2xl font-black text-slate-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ubicación
                </h2>
                <p className="text-slate-400 text-xs mb-4 font-mono">
                  {destino.lat.toFixed(6)}, {destino.lng.toFixed(6)}
                </p>
              </div>
              <div style={{ height: "280px" }}>
                <MapContainer
                  center={coords}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />
                  <Marker position={coords} icon={iconoPersonalizado}>
                    <Popup>
                      <strong>{destino.nombre}</strong>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="p-4">
                <Link
                  to="/mapa"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "#1a1a2e", color: "#fff" }}
                >
                  <MapPin size={14} /> Ver en mapa completo
                </Link>
              </div>
            </div>
            {/* Servicios cercanos */}
            {servicios.length > 0 && (
              <div
                className="bg-white rounded-2xl p-8"
                style={{ border: "1px solid #f1f5f9" }}
              >
                <h2
                  className="text-2xl font-black text-slate-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Servicios cercanos
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Hoteles, restaurantes y farmacias a menos de 2 km
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {servicios.map((s) => {
                    const iconos = {
                      hotel: "🏨",
                      restaurante: "🍽️",
                      farmacia: "💊",
                    };
                    const colores = {
                      hotel: "#3b82f6",
                      restaurante: "#f59e0b",
                      farmacia: "#10b981",
                    };
                    return (
                      <div
                        key={s.id}
                        className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: "#f8f9fa" }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{ background: `${colores[s.tipo]}15` }}
                        >
                          {iconos[s.tipo] || "📍"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {s.nombre}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">
                            {s.tipo}
                          </p>
                          {s.direccion &&
                            s.direccion !== "Sin direccion registrada" && (
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {s.direccion}
                              </p>
                            )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-amber-500">
                              ★ {s.rating}
                            </span>
                            {s.telefono && (
                              <span className="text-xs text-slate-400">
                                · {s.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Galería de la comunidad */}
            {fotos.length > 0 && (
              <div
                className="bg-white rounded-2xl p-8"
                style={{ border: "1px solid #f1f5f9" }}
              >
                <h2
                  className="text-2xl font-black text-slate-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Fotos de viajeros
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {fotos.length}{" "}
                  {fotos.length === 1 ? "foto compartida" : "fotos compartidas"}{" "}
                  por la comunidad
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotos.map((f) => (
                    <div
                      key={f.id}
                      className="aspect-square rounded-xl overflow-hidden"
                      style={{ border: "1px solid #f1f5f9" }}
                    >
                      <img
                        src={f.url}
                        alt="Foto compartida por viajero"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Subir foto */}
            <SubirFoto
              destinoId={destino.id}
              destinoNombre={destino.nombre}
              onFotoSubida={() => getFotos(id).then((data) => setFotos(data))}
            />
          </div>

          {/* Columna lateral */}
          <div className="flex flex-col gap-6">
            <div
              className="bg-white rounded-2xl p-6"
              style={{ border: "1px solid #f1f5f9" }}
            >
              <h3
                className="text-lg font-black text-slate-900 mb-5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Información
              </h3>
              {[
                { label: "Entrada", valor: destino.entrada },
                { label: "Horario", valor: destino.horario },
                { label: "Duración", valor: destino.tiempo_visita },
                {
                  label: "Altitud",
                  valor: elevacion
                    ? `${elevacion.toLocaleString()} msnm`
                    : "Consultando...",
                },

                {
                  label: "Clima ahora",
                  valor: clima
                    ? `${emojiClima(clima.weathercode)} ${clima.temperature_2m}°C`
                    : "Consultando...",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-slate-800 text-right">
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: color }}
            >
              <div
                className="text-6xl font-black text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {destino.rating}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={
                      i <= Math.round(destino.rating) ? "#fff" : "transparent"
                    }
                    color="#fff"
                  />
                ))}
              </div>
              <p className="text-white/80 text-xs font-semibold">
                Calificación de visitantes
              </p>
            </div>

            <Link
              to="/mapa"
              className="flex items-center justify-between p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div>
                <p className="text-white font-bold text-sm">Ver en el mapa</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Mapa interactivo SIG
                </p>
              </div>
              <ChevronRight size={20} color="#f59e0b" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
