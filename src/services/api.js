const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

export async function getDestinos(categoria = null) {
  const url = categoria && categoria !== 'Todos'
    ? `${API_URL}/destinos?categoria=${encodeURIComponent(categoria)}`
    : `${API_URL}/destinos`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Error al cargar destinos')
  return res.json()
}

export async function getDestino(id) {
  const res = await fetch(`${API_URL}/destinos/${id}`)
  if (!res.ok) throw new Error('Destino no encontrado')
  return res.json()
}

export async function getCategorias() {
  const res = await fetch(`${API_URL}/categorias`)
  if (!res.ok) throw new Error('Error al cargar categorías')
  return res.json()
}

export async function getServiciosCercanos(destinoId, radio = 2000, tipo = null) {
  let url = `${API_URL}/destinos/${destinoId}/cercanos?radio=${radio}`
  if (tipo) url += `&tipo=${tipo}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Error al cargar servicios cercanos')
  return res.json()
}

export async function getRutas() {
  const res = await fetch(`${API_URL}/rutas`)
  if (!res.ok) throw new Error('Error al cargar rutas')
  return res.json()
}

export async function guardarFoto(destinoId, url) {
  const res = await fetch(`${API_URL}/destinos/${destinoId}/fotos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error('Error al guardar la foto')
  return res.json()
}

export async function getFotos(destinoId) {
  const res = await fetch(`${API_URL}/destinos/${destinoId}/fotos`)
  if (!res.ok) throw new Error('Error al cargar fotos')
  return res.json()
}