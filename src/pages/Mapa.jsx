import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  MapPin,
  Layers,
  Navigation,
  X,
  Star,
  Clock,
  Filter,
  Loader2,
  Route,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { getDestinos } from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const crearIcono = (color) =>
  L.divIcon({
    className: "",
    html: `
    <div style="
      width:36px; height:36px;
      background:${color};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 12px rgba(0,0,0,0.25);
    ">
      <div style="
        width:10px; height:10px;
        background:white;
        border-radius:50%;
        position:absolute;
        top:50%; left:50%;
        transform:translate(-50%,-50%) rotate(45deg);
      "></div>
    </div>
  `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

const iconoOrigen = L.divIcon({
  className: "",
  html: `
    <div style="
      width:32px; height:32px;
      background:#3b82f6;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 0 4px rgba(59,130,246,0.3);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const CAPAS = [
  {
    id: "osm",
    label: "Mapa",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "© OpenStreetMap",
  },
  {
    id: "topo",
    label: "Topografía",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: "© OpenTopoMap",
  },
  {
    id: "oscuro",
    label: "Oscuro",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attr: "© Stadia Maps",
  },
  {
    id: "sat",
    label: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri",
  },
];

const CATEGORIAS = [
  "Todos",
  "Mirador",
  "Transporte",
  "Cultura",
  "Naturaleza",
  "Aventura",
];

// Componente para cambiar capa
function CambiaCapa({ url, attr }) {
  const map = useMap();
  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    L.tileLayer(url, { attribution: attr }).addTo(map);
  }, [url]);
  return null;
}
// Click en el mapa para definir origen
function ClickEnMapa({ panelRuta, onClickMapa }) {
  const map = useMap();
  useEffect(() => {
    if (!panelRuta) return;
    const handler = (e) => {
      onClickMapa([e.latlng.lat, e.latlng.lng]);
    };
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [panelRuta]);
  return null;
}

// Componente para volar a coordenadas
function VolarA({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.5 });
  }, [coords]);
  return null;
}

// Componente de routing con OSRM
function ControlRuta({ origen, destino, onListo }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!origen || !destino) return;

    // Limpiar ruta anterior
    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(origen[0], origen[1]),
        L.latLng(destino[0], destino[1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false, // ocultamos el panel de instrucciones feo por defecto
      lineOptions: {
        styles: [{ color: "#dc2626", weight: 6, opacity: 0.9 }],
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
      createMarker: () => null, // usamos nuestros propios marcadores
    })
      .on("routesfound", (e) => {
        const resumen = e.routes[0].summary;
        if (onListo)
          onListo({
            distancia: (resumen.totalDistance / 1000).toFixed(1),
            tiempo: Math.round(resumen.totalTime / 60),
          });
      })
      .addTo(map);

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [origen, destino]);

  return null;
}

export default function Mapa() {
  const [capaActiva, setCapaActiva] = useState("osm");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [panelCapas, setPanelCapas] = useState(false);
  const [panelFiltros, setPanelFiltros] = useState(false);
  const [panelRuta, setPanelRuta] = useState(false);
  const [volarA, setVolarA] = useState(null);
  const [ubicacionUser, setUbicacionUser] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de routing
  const [origenRuta, setOrigenRuta] = useState(null);
  const [destinoRuta, setDestinoRuta] = useState(null);
  const [origenTexto, setOrigenTexto] = useState("");
  const [destinoRutaId, setDestinoRutaId] = useState("");
  const [infoRuta, setInfoRuta] = useState(null);
  const [calculandoRuta, setCalculandoRuta] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [clickPendiente, setClickPendiente] = useState(null);

  const capa = CAPAS.find((c) => c.id === capaActiva);

  useEffect(() => {
    setCargando(true);
    setError(null);
    getDestinos(categoriaActiva)
      .then((data) => setDestinos(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [categoriaActiva]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const geolocalizarme = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUbicacionUser(coords);
      setVolarA(coords);
      setOrigenRuta(coords);
      setOrigenTexto("Mi ubicación actual");
    });
  };

  const calcularRuta = () => {
    if (!origenRuta) {
      alert("Primero define un punto de origen");
      return;
    }
    if (!destinoRutaId) {
      alert("Selecciona un destino turístico");
      return;
    }
    const dest = destinos.find((d) => d.id === parseInt(destinoRutaId));
    if (!dest) return;
    setCalculandoRuta(true);
    setDestinoRuta([dest.lat, dest.lng]);
    setInfoRuta(null);
    setTimeout(() => setCalculandoRuta(false), 3000);
  };

  const limpiarRuta = () => {
    setOrigenRuta(null);
    setDestinoRuta(null);
    setOrigenTexto("");
    setDestinoRutaId("");
    setInfoRuta(null);
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="h-screen flex flex-col pt-20"
    >
      {/* ── BARRA SUPERIOR ── */}
      <div
        className="flex items-center justify-between px-4 md:px-8 py-3 gap-3 flex-wrap"
        style={{
          background: "#1a1a2e",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-amber-400" />
          <h1
            className="text-white font-black text-lg"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Mapa <span className="text-amber-400">Interactivo</span>
          </h1>
          <span className="text-slate-500 text-xs ml-2 hidden md:block">
            {cargando ? "cargando..." : `${destinos.length} destinos visibles`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Rutas */}
          <button
            onClick={() => {
              setPanelRuta(!panelRuta);
              setPanelFiltros(false);
              setPanelCapas(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: panelRuta ? "#f59e0b" : "rgba(255,255,255,0.08)",
              color: panelRuta ? "#fff" : "#94a3b8",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Route size={13} />
            Calcular Ruta
          </button>

          {/* Filtro categorías */}
          <div className="relative">
            <button
              onClick={() => {
                setPanelFiltros(!panelFiltros);
                setPanelCapas(false);
                setPanelRuta(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: panelFiltros ? "#f59e0b" : "rgba(255,255,255,0.08)",
                color: panelFiltros ? "#fff" : "#94a3b8",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Filter size={13} />
              {categoriaActiva === "Todos" ? "Categorías" : categoriaActiva}
            </button>
            {panelFiltros && (
              <div
                className="absolute top-full left-0 mt-2 p-2 rounded-xl shadow-2xl z-[1000] flex flex-col gap-1 min-w-[160px]"
                style={{
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoriaActiva(cat);
                      setPanelFiltros(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all"
                    style={{
                      background:
                        categoriaActiva === cat ? "#f59e0b" : "transparent",
                      color: categoriaActiva === cat ? "#fff" : "#94a3b8",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selector de capas */}
          <div className="relative">
            <button
              onClick={() => {
                setPanelCapas(!panelCapas);
                setPanelFiltros(false);
                setPanelRuta(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: panelCapas ? "#f59e0b" : "rgba(255,255,255,0.08)",
                color: panelCapas ? "#fff" : "#94a3b8",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Layers size={13} />
              {capa.label}
            </button>
            {panelCapas && (
              <div
                className="absolute top-full right-0 mt-2 p-2 rounded-xl shadow-2xl z-[1000] flex flex-col gap-1 min-w-[150px]"
                style={{
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {CAPAS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCapaActiva(c.id);
                      setPanelCapas(false);
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all"
                    style={{
                      background:
                        capaActiva === c.id ? "#f59e0b" : "transparent",
                      color: capaActiva === c.id ? "#fff" : "#94a3b8",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Geolocalización */}
          <button
            onClick={geolocalizarme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: ubicacionUser ? "#10b981" : "rgba(255,255,255,0.08)",
              color: ubicacionUser ? "#fff" : "#94a3b8",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Navigation size={13} />
            {ubicacionUser ? "Ubicado" : "Mi ubicación"}
          </button>
        </div>
      </div>

      {/* ── PANEL DE RUTA ── */}
      {panelRuta && (
        <div
          className="px-4 md:px-8 py-4 flex flex-wrap items-end gap-4"
          style={{
            background: "#0f172a",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Origen */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px] relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Desde
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ej: La Ceja, El Alto..."
                  value={origenTexto}
                  onChange={async (e) => {
                    const valor = e.target.value;
                    setOrigenTexto(valor);
                    setOrigenRuta(null);
                    setSugerencias([]);
                    if (valor.length < 2) return;
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(valor + " Bolivia")}&format=json&limit=5&addressdetails=1`,
                        { headers: { "Accept-Language": "es" } },
                      );
                      const data = await res.json();
                      setSugerencias(data);
                    } catch {
                      setSugerencias([]);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${origenRuta ? "#10b981" : "rgba(255,255,255,0.15)"}`,
                    color: "#fff",
                  }}
                />
                {/* Lista de sugerencias */}
                {sugerencias.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl z-[2000]"
                    style={{
                      background: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {sugerencias.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setOrigenTexto(
                            s.display_name.split(",").slice(0, 2).join(","),
                          );
                          setOrigenRuta([parseFloat(s.lat), parseFloat(s.lon)]);
                          setSugerencias([]);
                        }}
                        className="w-full text-left px-4 py-3 text-xs transition-all hover:bg-white/10"
                        style={{
                          color: "#e2e8f0",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span className="font-semibold">
                          📍 {s.display_name.split(",").slice(0, 2).join(",")}
                        </span>
                        <span className="text-slate-500 ml-1 text-[10px]">
                          {s.display_name.split(",").slice(2, 4).join(",")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={geolocalizarme}
                className="px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0"
                style={{
                  background: ubicacionUser ? "#10b981" : "#3b82f6",
                  color: "#fff",
                }}
                title="Usar mi ubicación actual"
              >
                <Navigation size={13} />
              </button>
            </div>
            {origenRuta && (
              <p className="text-green-400 text-xs font-semibold">
                ✅ Punto de origen confirmado
              </p>
            )}
            {origenTexto && !origenRuta && (
              <p className="text-amber-400 text-xs">
                Selecciona un lugar de la lista
              </p>
            )}
          </div>

          {/* Destino */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hasta
            </label>
            <select
              value={destinoRutaId}
              onChange={(e) => setDestinoRutaId(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              <option value="" style={{ background: "#1e293b" }}>
                Selecciona un destino
              </option>
              {destinos.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                  style={{ background: "#1e293b" }}
                >
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={calcularRuta}
              disabled={calculandoRuta || !origenRuta || !destinoRutaId}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background:
                  !origenRuta || !destinoRutaId ? "#334155" : "#f59e0b",
                color: "#fff",
              }}
            >
              {calculandoRuta ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Route size={14} />
              )}
              Calcular
            </button>
            {destinoRuta && (
              <button
                onClick={limpiarRuta}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                }}
              >
                <X size={14} /> Limpiar
              </button>
            )}
          </div>

          {/* Info de la ruta calculada */}
          {infoRuta && (
            <div
              className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm"
              style={{
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <span className="text-amber-400 font-bold">
                📍 {infoRuta.distancia} km
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-400 font-bold">
                🕐 ~{infoRuta.tiempo} min
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── CONTENIDO: MAPA + SIDEBAR ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Loading overlay */}
        {cargando && (
          <div
            className="absolute inset-0 z-[1001] flex items-center justify-center"
            style={{ background: "rgba(248,249,250,0.8)" }}
          >
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "#f59e0b" }}
              />
              <p className="text-sm font-medium">Cargando destinos...</p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div
          className="hidden lg:flex flex-col w-80 overflow-y-auto"
          style={{ background: "#f8f9fa", borderRight: "1px solid #e2e8f0" }}
        >
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Destinos · {destinos.length}
            </p>
          </div>
          {destinos.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setDestinoSeleccionado(d);
                setVolarA([d.lat, d.lng]);
                if (panelRuta) setDestinoRutaId(String(d.id));
              }}
              className="flex items-center gap-3 p-4 text-left transition-all border-b"
              style={{
                background:
                  destinoSeleccionado?.id === d.id ? "#fff7ed" : "transparent",
                borderColor: "#f1f5f9",
                borderLeft:
                  destinoSeleccionado?.id === d.id
                    ? `3px solid ${d.categoria_color}`
                    : "3px solid transparent",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  border: `2px solid ${d.categoria_color}`,
                  background: "#f1f5f9",
                }}
              >
                <MapPin size={16} color={d.categoria_color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {d.nombre}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: d.categoria_color }}
                  >
                    {d.categoria}
                  </span>
                  <span className="text-slate-300">·</span>
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  <span className="text-xs font-bold text-slate-600">
                    {d.rating}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          <MapContainer
            center={[-16.5, -68.15]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <CambiaCapa url={capa.url} attr={capa.attr} />
            {volarA && <VolarA coords={volarA} />}
            {/* Click en mapa para definir origen */}
            <ClickEnMapa
              panelRuta={panelRuta}
              onClickMapa={(coords) => setClickPendiente(coords)}
            />

            {/* Línea de ruta */}
            {origenRuta && destinoRuta && (
              <ControlRuta
                origen={origenRuta}
                destino={destinoRuta}
                onListo={(info) => setInfoRuta(info)}
              />
            )}

            {/* Marcador de origen manual */}
            {origenRuta && (
              <Marker position={origenRuta} icon={iconoOrigen}>
                <Popup>
                  <strong>📍 {origenTexto || "Punto de inicio"}</strong>
                </Popup>
              </Marker>
            )}

            {/* Marcadores destinos */}
            {destinos.map((d) => (
              <Marker
                key={d.id}
                position={[d.lat, d.lng]}
                icon={crearIcono(d.categoria_color)}
                eventHandlers={{
                  click: () => {
                    setDestinoSeleccionado(d);
                    if (panelRuta) setDestinoRutaId(String(d.id));
                  },
                }}
              >
                <Popup>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      minWidth: "180px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 900,
                        fontSize: "15px",
                        color: "#1a1a2e",
                        marginBottom: "4px",
                      }}
                    >
                      {d.nombre}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "8px",
                        lineHeight: "1.4",
                      }}
                    >
                      {d.descripcion}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        fontSize: "11px",
                        color: "#94a3b8",
                      }}
                    >
                      <span>⭐ {d.rating}</span>
                      <span>🕐 {d.tiempo_visita}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Marcador usuario */}
            {ubicacionUser && !origenRuta && (
              <Marker
                position={ubicacionUser}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.25);"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <strong>📍 Tu ubicación actual</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          {/* Modal confirmación click en mapa */}
          {clickPendiente && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
              style={{
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.15)",
                minWidth: "280px",
                maxWidth: "90vw",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#3b82f620" }}
                >
                  <MapPin size={15} color="#3b82f6" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">
                    ¿Salir desde este punto?
                  </p>
                  <p className="text-slate-400 text-xs font-mono">
                    {clickPendiente[0].toFixed(5)},{" "}
                    {clickPendiente[1].toFixed(5)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setOrigenRuta(clickPendiente);
                    setOrigenTexto(
                      `${clickPendiente[0].toFixed(4)}, ${clickPendiente[1].toFixed(4)}`,
                    );
                    setSugerencias([]);
                    setClickPendiente(null);
                  }}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "#3b82f6", color: "#fff" }}
                >
                  ✅ Sí, desde aquí
                </button>
                <button
                  onClick={() => setClickPendiente(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#94a3b8",
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Panel info destino */}
          {destinoSeleccionado && (
            <div
              className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 rounded-2xl overflow-hidden shadow-2xl z-[999]"
              style={{ border: "1px solid #e2e8f0", background: "#fff" }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background: destinoSeleccionado.categoria_color,
                      color: "#fff",
                    }}
                  >
                    {destinoSeleccionado.categoria}
                  </span>
                  <button
                    onClick={() => setDestinoSeleccionado(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100"
                  >
                    <X size={13} />
                  </button>
                </div>
                <h3
                  className="font-black text-lg text-slate-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {destinoSeleccionado.nombre}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  {destinoSeleccionado.descripcion}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Star size={11} fill="#f59e0b" color="#f59e0b" />
                    <strong className="text-slate-700">
                      {destinoSeleccionado.rating}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {destinoSeleccionado.tiempo_visita}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/destinos/${destinoSeleccionado.id}`}
                    className="flex-1 block text-center text-xs font-bold py-2 rounded-lg"
                    style={{ background: "#1a1a2e", color: "#fff" }}
                  >
                    Ver detalle
                  </a>
                  {panelRuta && (
                    <button
                      onClick={() => {
                        setDestinoRutaId(String(destinoSeleccionado.id));
                      }}
                      className="flex-1 text-xs font-bold py-2 rounded-lg transition-all"
                      style={{ background: "#f59e0b", color: "#fff" }}
                    >
                      Ir aquí 🗺️
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
