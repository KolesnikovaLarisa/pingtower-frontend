import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ResourcesPage from './pages/ResourcesPage'
import ResourceCabinet from './pages/ResourceCabinet'
import ObservationsPage from './pages/ObservationsPage'
import UserCabinetPage from './pages/UserCabinetPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected app routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<ResourcesPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/:id" element={<ResourceCabinet />} />
        <Route path="observations" element={<ObservationsPage />} />
        <Route path="cabinet" element={<UserCabinetPage />} />
      </Route>
    </Routes>
  )
}

export default App
