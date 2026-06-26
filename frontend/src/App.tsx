import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/Login'

// Pages (lazy loaded via React.lazy in future — imported directly for now)
import DashboardPage      from '@/pages/Dashboard'
import GerenciamentoPage  from '@/pages/Gerenciamento'
import PCPPage            from '@/pages/PCP'
import AlmoxarifadoPage   from '@/pages/Almoxarifado'
import PreparacaoPage     from '@/pages/Preparacao'
import PreparacaoLotePage from '@/pages/PreparacaoLote'
import ProducaoPage       from '@/pages/Producao'
import Box4Page           from '@/pages/Box4'
import Box5Page           from '@/pages/Box5'
import Box6Page           from '@/pages/Box6'
import SecadoraPage       from '@/pages/Secadora'
import DestrinchagePage   from '@/pages/Destrinchagem'
import EnolagemPage       from '@/pages/Enrolagem'
import QualidadePage      from '@/pages/Qualidade'
import LaboratorioPage    from '@/pages/Laboratorio'
import PesagemPage        from '@/pages/Pesagem'
import ListaSaidaPage     from '@/pages/ListaSaida'
import FabricQualityPage  from '@/pages/FabricQuality'
import SettingsPage       from '@/pages/Settings'
import AdminPage          from '@/pages/Admin'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"       element={<DashboardPage />} />
        <Route path="gerenciamento"   element={<GerenciamentoPage />} />
        <Route path="pcp"             element={<PCPPage />} />
        <Route path="almoxarifado"    element={<AlmoxarifadoPage />} />
        <Route path="preparacao"      element={<PreparacaoPage />} />
        <Route path="preparacao-lote" element={<PreparacaoLotePage />} />
        <Route path="producao"        element={<ProducaoPage />} />
        <Route path="box4"            element={<Box4Page />} />
        <Route path="box5"            element={<Box5Page />} />
        <Route path="box6"            element={<Box6Page />} />
        <Route path="secadora"        element={<SecadoraPage />} />
        <Route path="destrinchagem"   element={<DestrinchagePage />} />
        <Route path="enrolagem"       element={<EnolagemPage />} />
        <Route path="qualidade"       element={<QualidadePage />} />
        <Route path="laboratorio"     element={<LaboratorioPage />} />
        <Route path="pesagem"         element={<PesagemPage />} />
        <Route path="lista-saida"     element={<ListaSaidaPage />} />
        <Route path="fabric-quality"  element={<FabricQualityPage />} />
        <Route path="settings"        element={<SettingsPage />} />
        <Route path="admin"           element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
