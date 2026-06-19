import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { MapPin, Layers, Navigation, X, Star, Clock, Filter } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import mirador    from '../assets/fondo/mirador.png'
import teleferico from '../assets/fondo/teleferico.jpg'
import feria      from '../assets/fondo/feria.jpeg'
import valle      from '../assets/fondo/valle-de-la-luna.jpg'
import titicaca   from '../assets/fondo/lago-titicaca.jpg'
import coroico    from '../assets/fondo/coroico.jpg'

// Fix icono leaflet con vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Iconos personalizados por categoría
const crearIcono = (color) => L.divIcon({
  className: '',
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
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
  popupAnchor:[0, -38],
})

const COLORES = {
  Mirador:    '#f59e0b',
  Transporte: '#3b82f6',
  Cultura:    '#8b5cf6',
  Naturaleza: '#10b981',
  Aventura:   '#ef4444',
}

const DESTINOS = [
  { id:1, nombre:'Mirador Killi Killi',  categoria:'Mirador',    coords:[-16.4897,-68.1193], rating:4.8, tiempo:'1-2h',        img: mirador,    descripcion:'Vista panorámica de La Paz y el nevado Illimani.' },
  { id:2, nombre:'Mi Teleférico',        categoria:'Transporte', coords:[-16.5000,-68.1500], rating:4.9, tiempo:'1-2h',        img: teleferico, descripcion:'La red de teleféricos más alta del mundo.' },
  { id:3, nombre:'Feria de El Alto',     categoria:'Cultura',    coords:[-16.5036,-68.1500], rating:4.7, tiempo:'2-3h',        img: feria,      descripcion:'Una de las ferias más grandes de Sudamérica.' },
  { id:4, nombre:'Valle de la Luna',     categoria:'Naturaleza', coords:[-16.5500,-68.0833], rating:4.8, tiempo:'2-3h',        img: valle,      descripcion:'Formaciones rocosas únicas de otro mundo.' },
  { id:5, nombre:'Lago Titicaca',        categoria:'Naturaleza', coords:[-16.0000,-69.2000], rating:4.9, tiempo:'Día completo', img: titicaca,   descripcion:'El lago navegable más alto del mundo.' },
  { id:6, nombre:'Coroico',             categoria:'Aventura',   coords:[-16.1833,-67.7167], rating:4.8, tiempo:'Día completo', img: coroico,    descripcion:'Yungas bolivianos con la famosa Ruta de la Muerte.' },
]

const CAPAS = [
  { id:'osm',    label:'Mapa',      url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                                   attr:'© OpenStreetMap' },
  { id:'topo',   label:'Topografía',url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                                                     attr:'© OpenTopoMap'   },
  { id:'oscuro', label:'Oscuro',    url:'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',                                            attr:'© Stadia Maps'   },
  { id:'sat',    label:'Satélite',  url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',                         attr:'© Esri'          },
]

const CATEGORIAS = ['Todos', 'Mirador', 'Transporte', 'Cultura', 'Naturaleza', 'Aventura']

// Componente para cambiar capa del mapa
function CambiaCapa({ url, attr }) {
  const map = useMap()
  useEffect(() => {
    map.eachLayer(layer => { if (layer instanceof L.TileLayer) map.removeLayer(layer) })
    L.tileLayer(url, { attribution: attr }).addTo(map)
  }, [url])
  return null
}

// Componente para volar a coordenadas
function VolarA({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.5 })
  }, [coords])
  return null
}

export default function Mapa() {
  const [capaActiva, setCapaActiva]       = useState('osm')
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null)
  const [panelCapas, setPanelCapas]       = useState(false)
  const [panelFiltros, setPanelFiltros]   = useState(false)
  const [volarA, setVolarA]               = useState(null)
  const [ubicacionUser, setUbicacionUser] = useState(null)

  const capa = CAPAS.find(c => c.id === capaActiva)

  const destinosFiltrados = DESTINOS.filter(d =>
    categoriaActiva === 'Todos' || d.categoria === categoriaActiva
  )

  const geolocalizarme = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.latitude, pos.coords.longitude]
      setUbicacionUser(coords)
      setVolarA(coords)
    })
  }

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="h-screen flex flex-col pt-20">

      {/* ── BARRA SUPERIOR ── */}
      <div
        className="flex items-center justify-between px-4 md:px-8 py-3 gap-3 flex-wrap"
        style={{ background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
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
            {destinosFiltrados.length} destinos visibles
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro categorías */}
          <div className="relative">
            <button
              onClick={() => { setPanelFiltros(!panelFiltros); setPanelCapas(false) }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: panelFiltros ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                color:      panelFiltros ? '#fff'    : '#94a3b8',
                border:     '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Filter size={13} />
              {categoriaActiva === 'Todos' ? 'Categorías' : categoriaActiva}
            </button>
            {panelFiltros && (
              <div
                className="absolute top-full left-0 mt-2 p-2 rounded-xl shadow-2xl z-[1000] flex flex-col gap-1 min-w-[160px]"
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoriaActiva(cat); setPanelFiltros(false) }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all"
                    style={{
                      background: categoriaActiva === cat ? '#f59e0b' : 'transparent',
                      color:      categoriaActiva === cat ? '#fff'    : '#94a3b8',
                    }}
                  >
                    {cat !== 'Todos' && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: COLORES[cat] || '#64748b' }}
                      />
                    )}
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selector de capas */}
          <div className="relative">
            <button
              onClick={() => { setPanelCapas(!panelCapas); setPanelFiltros(false) }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: panelCapas ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                color:      panelCapas ? '#fff'    : '#94a3b8',
                border:     '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Layers size={13} />
              {capa.label}
            </button>
            {panelCapas && (
              <div
                className="absolute top-full right-0 mt-2 p-2 rounded-xl shadow-2xl z-[1000] flex flex-col gap-1 min-w-[150px]"
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {CAPAS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCapaActiva(c.id); setPanelCapas(false) }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all"
                    style={{
                      background: capaActiva === c.id ? '#f59e0b' : 'transparent',
                      color:      capaActiva === c.id ? '#fff'    : '#94a3b8',
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
              background: ubicacionUser ? '#10b981' : 'rgba(255,255,255,0.08)',
              color:      ubicacionUser ? '#fff'    : '#94a3b8',
              border:     '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Navigation size={13} />
            {ubicacionUser ? 'Ubicado' : 'Mi ubicación'}
          </button>
        </div>
      </div>

      {/* ── CONTENIDO: MAPA + SIDEBAR ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar de destinos */}
        <div
          className="hidden lg:flex flex-col w-80 overflow-y-auto"
          style={{ background: '#f8f9fa', borderRight: '1px solid #e2e8f0' }}
        >
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Destinos · {destinosFiltrados.length}
            </p>
          </div>
          {destinosFiltrados.map(d => (
            <button
              key={d.id}
              onClick={() => { setDestinoSeleccionado(d); setVolarA(d.coords) }}
              className="flex items-center gap-3 p-4 text-left transition-all border-b"
              style={{
                background:   destinoSeleccionado?.id === d.id ? '#fff7ed' : 'transparent',
                borderColor:  '#f1f5f9',
                borderLeft:   destinoSeleccionado?.id === d.id ? `3px solid ${COLORES[d.categoria]}` : '3px solid transparent',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                style={{ border: `2px solid ${COLORES[d.categoria]}` }}
              >
                <img src={d.img} alt={d.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{d.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: COLORES[d.categoria] }}
                  >
                    {d.categoria}
                  </span>
                  <span className="text-slate-300">·</span>
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  <span className="text-xs font-bold text-slate-600">{d.rating}</span>
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
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <CambiaCapa url={capa.url} attr={capa.attr} />
            {volarA && <VolarA coords={volarA} />}

            {/* Marcadores destinos */}
            {destinosFiltrados.map(d => (
              <Marker
                key={d.id}
                position={d.coords}
                icon={crearIcono(COLORES[d.categoria])}
                eventHandlers={{ click: () => setDestinoSeleccionado(d) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '200px' }}>
                    <img
                      src={d.img}
                      alt={d.nombre}
                      style={{ width:'100%', height:'110px', objectFit:'cover', borderRadius:'8px', marginBottom:'8px' }}
                    />
                    <div
                      style={{ fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:'15px', color:'#1a1a2e', marginBottom:'4px' }}
                    >
                      {d.nombre}
                    </div>
                    <p style={{ fontSize:'12px', color:'#64748b', marginBottom:'8px', lineHeight:'1.4' }}>
                      {d.descripcion}
                    </p>
                    <div style={{ display:'flex', gap:'12px', fontSize:'11px', color:'#94a3b8' }}>
                      <span>⭐ {d.rating}</span>
                      <span>🕐 {d.tiempo}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Marcador usuario */}
            {ubicacionUser && (
              <Marker
                position={ubicacionUser}
                icon={L.divIcon({
                  className: '',
                  html: `
                    <div style="
                      width:20px; height:20px;
                      background:#3b82f6;
                      border:3px solid white;
                      border-radius:50%;
                      box-shadow:0 0 0 6px rgba(59,130,246,0.25);
                    "></div>
                  `,
                  iconSize:   [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <strong>📍 Tu ubicación actual</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Panel info destino seleccionado (móvil y desktop) */}
          {destinoSeleccionado && (
            <div
              className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 rounded-2xl overflow-hidden shadow-2xl z-[999]"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <div className="relative h-36">
                <img
                  src={destinoSeleccionado.img}
                  alt={destinoSeleccionado.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <button
                  onClick={() => setDestinoSeleccionado(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                >
                  <X size={14} color="white" />
                </button>
                <span
                  className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{ background: COLORES[destinoSeleccionado.categoria], color: '#fff' }}
                >
                  {destinoSeleccionado.categoria}
                </span>
              </div>
              <div className="p-4" style={{ background: '#fff' }}>
                <h3
                  className="font-black text-lg text-slate-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {destinoSeleccionado.nombre}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  {destinoSeleccionado.descripcion}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star size={11} fill="#f59e0b" color="#f59e0b" />
                    <strong className="text-slate-700">{destinoSeleccionado.rating}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {destinoSeleccionado.tiempo}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {destinoSeleccionado.coords[0].toFixed(4)}, {destinoSeleccionado.coords[1].toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}