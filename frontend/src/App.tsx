import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

import Login         from '@/pages/Login'
import Dashboard     from '@/pages/Dashboard'
import Gerenciamento from '@/pages/Gerenciamento'
import PCP           from '@/pages/PCP'
import Almoxarifado  from '@/pages/Almoxarifado'
import Laboratorio   from '@/pages/Laboratorio'
import Pesagem       from '@/pages/Pesagem'
import Preparacao    from '@/pages/Preparacao'
import PreparacaoLote from '@/pages/PreparacaoLote'
import Producao      from '@/pages/Producao'
import Box4          from '@/pages/Box4'
import Box5          from '@/pages/Box5'
import Box6          from '@/pages/Box6'
import Secadora      from '@/pages/Secadora'
import Destrinchagem from '@/pages/Destrinchagem'
import Enrolagem     from '@/pages/Enrolagem'
import Qualidade     from '@/pages/Qualidade'
import FabricQuality from '@/pages/FabricQuality'
import ListaSaida    from '@/pages/ListaSaida'
import Settings      from '@/pages/Settings'
import Admin         from '@/pages/Admin'
import FichaEditor   from '@/components/FichaEditor/FichaEditor'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard"           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/gerenciamento"        element={<PrivateRoute><Gerenciamento /></PrivateRoute>} />
            <Route path="/pcp"                  element={<PrivateRoute><PCP /></PrivateRoute>} />
            <Route path="/almoxarifado"         element={<PrivateRoute><Almoxarifado /></PrivateRoute>} />
            <Route path="/laboratorio"          element={<PrivateRoute><Laboratorio /></PrivateRoute>} />
            <Route path="/pesagem"              element={<PrivateRoute><Pesagem /></PrivateRoute>} />
            <Route path="/preparacao"           element={<PrivateRoute><Preparacao /></PrivateRoute>} />
            <Route path="/preparacao-lote"      element={<PrivateRoute><PreparacaoLote /></PrivateRoute>} />
            <Route path="/producao"             element={<PrivateRoute><Producao /></PrivateRoute>} />
            <Route path="/box4"                 element={<PrivateRoute><Box4 /></PrivateRoute>} />
            <Route path="/box5"                 element={<PrivateRoute><Box5 /></PrivateRoute>} />
            <Route path="/box6"                 element={<PrivateRoute><Box6 /></PrivateRoute>} />
            <Route path="/secadora"             element={<PrivateRoute><Secadora /></PrivateRoute>} />
            <Route path="/destrinchagem"        element={<PrivateRoute><Destrinchagem /></PrivateRoute>} />
            <Route path="/enrolagem"            element={<PrivateRoute><Enrolagem /></PrivateRoute>} />
            <Route path="/qualidade"            element={<PrivateRoute><Qualidade /></PrivateRoute>} />
            <Route path="/fabric-quality"       element={<PrivateRoute><FabricQuality /></PrivateRoute>} />
            <Route path="/lista-saida"          element={<PrivateRoute><ListaSaida /></PrivateRoute>} />
            <Route path="/settings"             element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/admin"                element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/ficha-editor"   element={<AdminRoute><FichaEditor /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
