import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LeadPage from './pages/LeadPage'
import LeadDetailPage from './pages/LeadDetailPage'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><AnalyticsDashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id"
          element={
            <ProtectedRoute>
              <Layout><LeadDetailPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Layout><LeadPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<ProtectedRoute><Layout><LeadPage /></Layout></ProtectedRoute>} /> {/* Default route */}
      </Routes>
      <Toaster />
    </>
  )
}

export default App
