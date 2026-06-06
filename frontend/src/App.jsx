import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import OAuthCallback from './pages/OAuthCallback'
import Loading from './pages/Loading'
import Dashboard from './pages/Dashboard'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/loading/:jobId" element={<Loading />} />
          <Route path="/job/:jobId" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
