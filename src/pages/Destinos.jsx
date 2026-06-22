import { useEffect, useState } from 'react'
import { MapPin, Star, Clock, Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDestinos } from '../services/api'

const CATEGORIAS = ['Todos', 'Mirador', 'Transporte', 'Cultura', 'Naturaleza', 'Aventura']

function Img({ src, alt, className }) {
  const [err, setErr] = useState(false)
  return (!src || err) ? (
    <div className={`${className} flex flex-col items-center justify-center bg-slate-100 border-2 border-dashed border-slate-200 text-slate-400`}>
      <MapPin size={24} className="mb-1 opacity-40" />
      <span className="text-xs opacity-60">{alt}</span>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} onError={() => setErr(true)} />
  )
}

export default function Destinos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [filtrosVisible, setFiltrosVisible] = useState(false)
  const [destinos, setDestinos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // Carga destinos desde la API cada vez que cambia la categoría
  useEffect(() => {
    setCargando(true)
    setError(null)
    getDestinos(categoriaActiva)
      .then(data => setDestinos(data))
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))
  }, [categoriaActiva])

  const destinosFiltrados = destinos.filter(d =>
    d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8f9fa', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ background: '#1a1a2e' }} className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.3em] text-amber-400 uppercase mb-3">
            Explora La Paz & El Alto
          </p>
          <h1
            className="text-5xl md:text-6xl font-black text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Destinos <span className="text-amber-400">Turísticos</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl">
            Descubre los lugares más increíbles de La Paz y El Alto, desde miradores hasta aventuras en los Yungas.
          </p>

          {/* Buscador */}
          <div className="mt-8 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar destino..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setFiltrosVisible(!filtrosVisible)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filtrosVisible ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: filtrosVisible ? '#fff' : '#94a3b8',
              }}
            >
              <SlidersHorizontal size={15} />
              Filtros
            </button>
          </div>

          {/* Filtros por categoría */}
          {filtrosVisible && (
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: categoriaActiva === cat ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                    color: categoriaActiva === cat ? '#fff' : '#94a3b8',
                    border: categoriaActiva === cat ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTADOS ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-12">

        {/* Estado: cargando */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-3" style={{ color: '#f59e0b' }} />
            <p className="text-sm font-medium">Cargando destinos...</p>
          </div>
        )}

        {/* Estado: error */}
        {!cargando && error && (
          <div className="text-center py-24">
            <p className="text-red-500 font-semibold mb-2">No se pudo conectar con el servidor</p>
            <p className="text-slate-400 text-sm">{error}</p>
            <p className="text-slate-400 text-xs mt-2">¿Está corriendo el backend Flask en el puerto 5000?</p>
          </div>
        )}

        {/* Contenido cargado */}
        {!cargando && !error && (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-semibold text-slate-500">
                <span className="text-slate-900 font-black text-lg">{destinosFiltrados.length}</span>
                {' '}destinos encontrados
              </p>
              {(busqueda || categoriaActiva !== 'Todos') && (
                <button
                  onClick={() => { setBusqueda(''); setCategoriaActiva('Todos') }}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
                >
                  <X size={13} /> Limpiar filtros
                </button>
              )}
            </div>

            {destinosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinosFiltrados.map(d => (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col"
                    style={{ border: '1px solid #f1f5f9' }}
                  >
                    <div className="relative overflow-hidden" style={{ height: '220px' }}>
                      <Img
                        src={d.imagen_url}
                        alt={d.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: d.categoria_color || '#f59e0b', color: '#fff' }}
                      >
                        {d.categoria}
                      </span>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full px-2.5 py-1">
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        <span className="text-xs font-black text-slate-800">{d.rating}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="font-black text-lg text-slate-900 leading-tight"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {d.nombre}
                        </h3>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 shrink-0 mt-1"
                          style={{ background: '#f1f5f9', color: '#64748b' }}
                        >
                          {d.categoria}
                        </span>
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                        {d.descripcion}
                      </p>

                      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {d.tiempo_visita}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {d.altitud}
                          </span>
                        </div>
                        <Link
                          to={`/destinos/${d.id}`}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
                          style={{ background: '#1a1a2e', color: '#fff' }}
                        >
                          <MapPin size={11} /> Ver detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Search size={40} className="mx-auto text-slate-300 mb-4" />
                <h3
                  className="text-2xl font-black text-slate-700 mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Sin resultados
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  No encontramos destinos con "{busqueda}"
                </p>
                <button
                  onClick={() => { setBusqueda(''); setCategoriaActiva('Todos') }}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: '#1a1a2e' }}
                >
                  Ver todos los destinos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}