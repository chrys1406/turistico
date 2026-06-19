import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Destinos from './pages/Destinos'
import Mapa from './pages/Mapa'
import DetalleDestino from './pages/DetalleDestino'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/destinos"     element={<Destinos />} />
        <Route path="/destinos/:id" element={<DetalleDestino />} />
        <Route path="/mapa"         element={<Mapa />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App