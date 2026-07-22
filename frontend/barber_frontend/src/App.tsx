import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/dashboard/Dashboard'
import AgendaBarbeiro from './pages/dashboard/AgendaBarbeiro'
import ServicosBarbeiro from './pages/dashboard/ServicosBarbeiro'
import PortfolioBarbeiro from './pages/dashboard/PortfolioBarbeiro'
import Relatorios from './pages/dashboard/Relatorios'
import Agendamento from './pages/Agendamento'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/agenda" element={<AgendaBarbeiro />} />
          <Route path="/dashboard/servicos" element={<ServicosBarbeiro />} />
          <Route path="/dashboard/portfolio" element={<PortfolioBarbeiro />} />
          <Route path="/dashboard/relatorios" element={<Relatorios />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
