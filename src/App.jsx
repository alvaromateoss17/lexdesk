import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expedientes from './pages/Expedientes'
import ExpedienteDetalle from './pages/ExpedienteDetalle'
import Documentos from './pages/Documentos'
import Calendario from './pages/Calendario'
import AsistenteIA from './pages/AsistenteIA'
import Clientes from './pages/Clientes'
import ClienteDetalle from './pages/ClienteDetalle'
import ConvenioRegulador from './pages/ConvenioRegulador'
import Calculadoras from './pages/Calculadoras'
import Mediacion from './pages/Mediacion'
import PortalCliente from './pages/PortalCliente'
import Facturacion from './pages/Facturacion'
import FacturaDetalle from './pages/FacturaDetalle'
import Tareas from './pages/Tareas'
import Configuracion from './pages/Configuracion'
import InstallPrompt from './components/InstallPrompt'

function EmptyScreen({ name }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '120px 0', textAlign: 'center' }}>
      <div>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--radius)',
          background: 'var(--s2)', border: '1px solid var(--bd)',
          display: 'grid', placeItems: 'center', margin: '0 auto 18px',
          color: 'var(--tx2)', fontSize: 22,
        }}>
          ⚙️
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-.02em' }}>{name}</h2>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--tx2)' }}>Próximamente disponible.</div>
      </div>
    </div>
  )
}

function Layout({ children, fullHeight }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar />
        <main style={{
          flex: 1,
          overflow: fullHeight ? 'hidden' : 'auto',
          background: 'var(--bg)',
          padding: fullHeight ? 0 : '0',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
    <InstallPrompt />
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/expedientes" element={<PrivateRoute><Layout><Expedientes /></Layout></PrivateRoute>} />
      <Route path="/expedientes/:id" element={<PrivateRoute><Layout><ExpedienteDetalle /></Layout></PrivateRoute>} />
      <Route path="/documentos" element={<PrivateRoute><Layout><Documentos /></Layout></PrivateRoute>} />
      <Route path="/calendario" element={<PrivateRoute><Layout><Calendario /></Layout></PrivateRoute>} />
      <Route path="/asistente" element={<PrivateRoute><Layout fullHeight><AsistenteIA /></Layout></PrivateRoute>} />
      <Route path="/clientes"            element={<PrivateRoute><Layout><Clientes /></Layout></PrivateRoute>} />
      <Route path="/clientes/:id"       element={<PrivateRoute><Layout><ClienteDetalle /></Layout></PrivateRoute>} />
      <Route path="/convenio-regulador" element={<PrivateRoute><Layout><ConvenioRegulador /></Layout></PrivateRoute>} />
      <Route path="/calculadoras"       element={<PrivateRoute><Layout><Calculadoras /></Layout></PrivateRoute>} />
      <Route path="/mediacion"          element={<PrivateRoute><Layout><Mediacion /></Layout></PrivateRoute>} />
      <Route path="/portal-cliente"     element={<PrivateRoute><Layout><PortalCliente /></Layout></PrivateRoute>} />
      <Route path="/facturacion"         element={<PrivateRoute><Layout><Facturacion /></Layout></PrivateRoute>} />
      <Route path="/facturacion/:id"     element={<PrivateRoute><Layout><FacturaDetalle /></Layout></PrivateRoute>} />
      <Route path="/tareas"             element={<Navigate to="/calendario" replace />} />
      <Route path="/configuracion"      element={<PrivateRoute><Layout fullHeight><Configuracion /></Layout></PrivateRoute>} />
    </Routes>
    </>
  )
}
