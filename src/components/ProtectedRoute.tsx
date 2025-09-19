import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useResourcesStore } from '../store/resourcesStore'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useResourcesStore()

  // Проверяем авторизацию из localStorage (mock)
  const isAuthenticated = isLoggedIn || localStorage.getItem('pingtower-auth') === 'true'

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

