import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { ArrowLeft, MapPin, Star, Clock, Navigation, Share2, Heart, ChevronRight } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import mirador    from '../assets/fondo/mirador.png'
import teleferico from '../assets/fondo/teleferico.jpg'
import feria      from '../assets/fondo/feria.jpeg'
import valle      from '../assets/fondo/valle-de-la-luna.jpg'
import titicaca   from '../assets/fondo/lago-titicaca.jpg'
import coroico    from '../assets/fondo/coroico.jpg'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const COLORES = {
  Mirador:    '#f59e0b',
  Transporte: '#3b82f6',
  Cultura:    '#8b5cf6',
  Naturaleza: '#10b981',
  Aventura:   '#ef4444',
}

const DESTINOS = [
  {
    id: 1,
    nombre:      'Mirador Killi Killi',
    categoria:   'Mirador',
    descripcion: 'El mirador más famoso de La Paz con vista panorámica de la ciudad y el nevado Illimani. Desde aquí puedes apreciar toda la cuenca donde se asienta La Paz, rodeada de montañas y con el imponente Illimani de fondo.',
    detalle:     'El Mirador Killi Killi es uno de los puntos más visitados de La Paz. Se encuentra en el barrio de Villa Pabón y ofrece una vista de 360 grados de la ciudad. Es especialmente hermoso al atardecer cuando el sol ilumina las laderas de los cerros.',
    distancia:   '2 km del centro',
    rating:      4.8,
    tiempo:      '1-2 horas',
    altitud:     '3.750 msnm',
    entrada:     'Gratuita',
    horario:     '6:00 - 20:00',
    img:         mirador,
    coords:      [-16.4897, -68.1193],
    tag:         'Gratuito',
    servicios:   ['Mirador techado', 'Bancas de descanso', 'Acceso peatonal', 'Fotografía permitida'],
    relacionados:[2, 4],
  },
  {
    id: 2,
    nombre:      'Mi Teleférico',
    categoria:   'Transporte',
    descripcion: 'La red de teleféricos urbanos más alta del mundo, conectando La Paz y El Alto a través de 10 líneas de diferentes colores con vistas espectaculares.',
    detalle:     'Mi Teleférico fue inaugurado en 2014 y se ha convertido en un ícono de La Paz. Con más de 10 líneas operativas, ofrece vistas únicas de la ciudad, el Illimani y el altiplano. Es tanto un medio de transporte como una atracción turística.',
    distancia:   'Centro de La Paz',
    rating:      4.9,
    tiempo:      '1-2 horas',
    altitud:     '3.640 msnm',
    entrada:     'Bs. 3 por tramo',
    horario:     '6:00 - 22:00',
    img:         teleferico,
    coords:      [-16.5000, -68.1500],
    tag:         'Icónico',
    servicios:   ['10 líneas disponibles', 'Acceso para discapacitados', 'Vistas panorámicas', 'Conexión La Paz - El Alto'],
    relacionados:[1, 3],
  },
  {
    id: 3,
    nombre:      'Feria de El Alto',
    categoria:   'Cultura',
    descripcion: 'Una de las ferias más grandes de Sudamérica, con miles de puestos de artesanías, ropa, electrónica, comida típica y todo tipo de productos.',
    detalle:     'La Feria 16 de Julio en El Alto es un fenómeno social y económico único. Cada jueves y domingo reúne a cientos de miles de personas. Es un espacio donde conviven la tradición aymara con la modernidad, reflejando la identidad cultural de Bolivia.',
    distancia:   '12 km del centro',
    rating:      4.7,
    tiempo:      '2-3 horas',
    altitud:     '4.050 msnm',
    entrada:     'Gratuita',
    horario:     'Jueves y Domingo 7:00 - 15:00',
    img:         feria,
    coords:      [-16.5036, -68.1500],
    tag:         'Cultural',
    servicios:   ['Comida típica', 'Artesanías', 'Transporte público', 'Amplia variedad de productos'],
    relacionados:[1, 2],
  },
  {
    id: 4,
    nombre:      'Valle de la Luna',
    categoria:   'Naturaleza',
    descripcion: 'Formaciones rocosas únicas de arcilla y yeso que simulan un paisaje lunar, resultado de miles de años de erosión. Un lugar fuera de este mundo a solo 10 km del centro.',
    detalle:     'El Valle de la Luna se formó por la erosión del agua y el viento sobre las capas de arcilla y yeso. Sus formaciones de color ocre y gris crean un paisaje surrealista único en Bolivia. Cuenta con senderos habilitados para recorrerlo con seguridad.',
    distancia:   '10 km del centro',
    rating:      4.8,
    tiempo:      '2-3 horas',
    altitud:     '3.350 msnm',
    entrada:     'Bs. 15',
    horario:     '8:00 - 17:00',
    img:         valle,
    coords:      [-16.5500, -68.0833],
    tag:         'Naturaleza',
    servicios:   ['Senderos señalizados', 'Guías turísticos', 'Área de descanso', 'Estacionamiento'],
    relacionados:[5, 6],
  },
  {
    id: 5,
    nombre:      'Lago Titicaca',
    categoria:   'Naturaleza',
    descripcion: 'El lago navegable más alto del mundo a 3.800 msnm, compartido entre Bolivia y Perú. Sus aguas azules profundas y las islas flotantes de los Uros son únicos en el mundo.',
    detalle:     'El Lago Titicaca tiene una profundidad máxima de 281 metros y una superficie de 8.372 km². En el lado boliviano se encuentra Copacabana, famosa por su basílica, y la Isla del Sol, cuna de la civilización inca según la mitología andina.',
    distancia:   '70 km de La Paz',
    rating:      4.9,
    tiempo:      'Día completo',
    altitud:     '3.810 msnm',
    entrada:     'Variable',
    horario:     'Todo el día',
    img:         titicaca,
    coords:      [-16.0000, -69.2000],
    tag:         'Lago',
    servicios:   ['Paseos en bote', 'Isla del Sol', 'Copacabana', 'Gastronomía local'],
    relacionados:[4, 6],
  },
  {
    id: 6,
    nombre:      'Coroico',
    categoria:   'Aventura',
    descripcion: 'Pueblo de los Yungas bolivianos rodeado de vegetación tropical, cascadas y montañas. Punto de llegada de la famosa Ruta de la Muerte, la carretera más peligrosa del mundo.',
    detalle:     'Coroico se encuentra a solo 90 km de La Paz pero el cambio de paisaje es radical: del altiplano frío se desciende a los valles tropicales de los Yungas. La Ruta de la Muerte (Camino de las Yungas) es hoy una atracción para ciclistas de todo el mundo.',
    distancia:   '90 km de La Paz',
    rating:      4.8,
    tiempo:      'Día completo',
    altitud:     '1.760 msnm',
    entrada:     'Variable',
    horario:     'Todo el día',
    img:         coroico,
    coords:      [-16.1833, -67.7167],
    tag:         'Aventura',
    servicios:   ['Ciclismo de montaña', 'Cascadas', 'Hospedajes', 'Restaurantes'],
    relacionados:[4, 5],
  },
]

function Img({ src, alt, className, style }) {
  const [err, setErr] = useState(false)
  return err ? (
    <div className={`${className} flex items-center justify-center bg-slate-100`} style={style}>
      <MapPin size={32} className="text-slate-300" />
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} />
  )
}

export default function DetalleDestino() {
  const { id } = useParams()
  const [favorito, setFavorito] = useState(false)
  const destino = DESTINOS.find(d => d.id === parseInt(id))
  const relacionados = DESTINOS.filter(d => destino?.relacionados?.includes(d.id))

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    window.scrollTo(0, 0)
  }, [id])

  if (!destino) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 mb-4">Destino no encontrado</p>
        <Link to="/destinos" className="text-amber-500 font-bold">← Volver a destinos</Link>
      </div>
    </div>
  )

  const color = COLORES[destino.categoria]

  const iconoPersonalizado = L.divIcon({
    className: '',
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
    iconSize:    [40, 40],
    iconAnchor:  [20, 40],
    popupAnchor: [0, -42],
  })

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8f9fa', minHeight: '100vh' }}>

      {/* ── HERO CON IMAGEN ── */}
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <Img
          src={destino.img}
          alt={destino.nombre}
          className="w-full h-full object-cover"
          style={{}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />

        {/* Botones flotantes */}
        <div className="absolute top-24 left-6 right-6 flex items-center justify-between">
          <Link
            to="/destinos"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all hover:-translate-x-1"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <ArrowLeft size={15} /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavorito(!favorito)}
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Heart size={16} fill={favorito ? '#ef4444' : 'none'} color={favorito ? '#ef4444' : '#fff'} />
            </button>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Share2 size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* Info sobre imagen */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: color, color: '#fff' }}
            >
              {destino.tag}
            </span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
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
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <strong className="text-white">{destino.rating}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {destino.tiempo}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {destino.distancia}
            </span>
            <span className="flex items-center gap-1">
              <Navigation size={13} /> {destino.altitud}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Descripción */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #f1f5f9' }}>
              <h2
                className="text-2xl font-black text-slate-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Sobre este lugar
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">{destino.descripcion}</p>
              <p className="text-slate-500 leading-relaxed text-sm">{destino.detalle}</p>
            </div>

            {/* Servicios */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #f1f5f9' }}>
              <h2
                className="text-2xl font-black text-slate-900 mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Servicios disponibles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destino.servicios.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: '#f8f9fa' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mapa mini */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
              <div className="p-6 pb-0">
                <h2
                  className="text-2xl font-black text-slate-900 mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ubicación
                </h2>
                <p className="text-slate-400 text-xs mb-4 font-mono">
                  {destino.coords[0].toFixed(6)}, {destino.coords[1].toFixed(6)}
                </p>
              </div>
              <div style={{ height: '280px' }}>
                <MapContainer
                  center={destino.coords}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />
                  <Marker position={destino.coords} icon={iconoPersonalizado}>
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
                  style={{ background: '#1a1a2e', color: '#fff' }}
                >
                  <MapPin size={14} /> Ver en mapa completo
                </Link>
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="flex flex-col gap-6">

            {/* Info rápida */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f1f5f9' }}>
              <h3
                className="text-lg font-black text-slate-900 mb-5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Información
              </h3>
              {[
                { label: 'Entrada',   valor: destino.entrada  },
                { label: 'Horario',   valor: destino.horario  },
                { label: 'Duración',  valor: destino.tiempo   },
                { label: 'Distancia', valor: destino.distancia },
                { label: 'Altitud',   valor: destino.altitud  },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800">{item.valor}</span>
                </div>
              ))}
            </div>

            {/* Rating visual */}
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
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    size={16}
                    fill={i <= Math.round(destino.rating) ? '#fff' : 'transparent'}
                    color="#fff"
                  />
                ))}
              </div>
              <p className="text-white/80 text-xs font-semibold">Calificación de visitantes</p>
            </div>

            {/* CTA mapa */}
            <Link
              to="/mapa"
              className="flex items-center justify-between p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div>
                <p className="text-white font-bold text-sm">Ver en el mapa</p>
                <p className="text-slate-400 text-xs mt-0.5">Mapa interactivo SIG</p>
              </div>
              <ChevronRight size={20} color="#f59e0b" />
            </Link>
          </div>
        </div>

        {/* ── DESTINOS RELACIONADOS ── */}
        {relacionados.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-3xl font-black text-slate-900 mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              También te puede <span style={{ color: '#f59e0b' }}>interesar</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relacionados.map(d => (
                <Link
                  key={d.id}
                  to={`/destinos/${d.id}`}
                  className="flex gap-4 bg-white rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-md group"
                  style={{ border: '1px solid #f1f5f9' }}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={d.img}
                      alt={d.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: COLORES[d.categoria] }}
                    >
                      {d.categoria}
                    </span>
                    <h4
                      className="font-black text-slate-900 text-sm mt-0.5 truncate"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {d.nombre}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Star size={10} fill="#f59e0b" color="#f59e0b" />
                      <span className="font-bold text-slate-600">{d.rating}</span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{d.tiempo}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 self-center shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}