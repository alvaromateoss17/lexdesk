import { Routes, Route } from 'react-router-dom'
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

function EmptyScreen({ name }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '120px 0', textAlign: 'center' }}>
      <div>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', margin: '0 auto 18px', color: 'var(--text-2)', fontSize: 22 }}>
          ⚙️
        </div>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{name}</h2>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Próximamente disponible.</div>
      </div>
    </div>
  )
}

function Layout({ children, fullHeight }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <div style={{ padding: fullHeight ? 0 : '28px 32px 56px', minWidth: 0, flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
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
      <Route path="/configuracion"      element={<PrivateRoute><Layout><EmptyScreen name="Configuración" /></Layout></PrivateRoute>} />
    </Routes>
  )
}
