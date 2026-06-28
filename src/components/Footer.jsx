import { Mountain } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-8 md:py-10 flex flex-col items-center gap-4 md:flex-row md:justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f59e0b' }}>
            <Mountain size={15} color="#1a1a2e" />
          </div>
          <span
            className="text-sm font-black tracking-widest uppercase text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            La Paz · Rutas Turisticas
          </span>
        </div>

        {/* Frase */}
        <p className="text-slate-400 text-xs md:text-sm italic text-center px-4 md:px-0">
          "Viajar es descubrir que siempre hay algo nuevo por conocer."
        </p>

        {/* Credito */}
        <p className="text-slate-600 text-xs text-center md:text-right">
          © 2026 · Proyecto SIG Universitario
        </p>

      </div>
    </footer>
  )
}