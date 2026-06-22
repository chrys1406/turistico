import { useState } from 'react'
import { Camera, Upload, X, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { guardarFoto } from '../services/api'

export default function SubirFoto({ destinoId, destinoNombre, onFotoSubida }) {
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  const manejarSeleccion = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB')
      return
    }

    setError(null)
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
  }

const subirFoto = async () => {
  if (!archivo) return
  setSubiendo(true)
  setError(null)

  try {
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `destino-${destinoId}-${Date.now()}.${extension}`

    const { error: errorSubida } = await supabase.storage
      .from('destinos-fotos')
      .upload(nombreArchivo, archivo)

    if (errorSubida) throw errorSubida

    const { data: urlData } = supabase.storage
      .from('destinos-fotos')
      .getPublicUrl(nombreArchivo)

    // Guardamos la URL en la base de datos, vinculada al destino
    await guardarFoto(destinoId, urlData.publicUrl)

    setExito(true)
    setArchivo(null)
    setPreview(null)
    if (onFotoSubida) onFotoSubida(urlData.publicUrl)

    setTimeout(() => setExito(false), 3000)
  } catch (err) {
    setError('No se pudo subir la imagen. Intenta de nuevo.')
    console.error(err)
  } finally {
    setSubiendo(false)
  }
}

  const cancelar = () => {
    setArchivo(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #f1f5f9' }}>
      <div className="flex items-center gap-2 mb-1">
        <Camera size={20} className="text-amber-500" />
        <h2
          className="text-2xl font-black text-slate-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Comparte tu foto
        </h2>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        ¿Visitaste {destinoNombre}? Sube tu foto y ayuda a otros viajeros
      </p>

      {!preview ? (
        <label
          className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl cursor-pointer transition-all hover:bg-slate-50"
          style={{ border: '2px dashed #e2e8f0' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: '#fff7ed' }}
          >
            <Upload size={22} className="text-amber-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">Click para subir una foto</p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG hasta 5MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={manejarSeleccion}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
          <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
          <button
            onClick={cancelar}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <X size={16} color="white" />
          </button>
          <div className="p-4 flex justify-end">
            <button
              onClick={subirFoto}
              disabled={subiendo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: subiendo ? '#cbd5e1' : '#1a1a2e',
                color: '#fff',
              }}
            >
              {subiendo ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <Upload size={15} /> Subir foto
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>
      )}

      {exito && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ background: '#f0fdf4' }}>
          <CheckCircle2 size={16} className="text-green-600" />
          <p className="text-sm font-semibold text-green-700">¡Foto subida con éxito! Gracias por compartir 🎉</p>
        </div>
      )}
    </div>
  )
}