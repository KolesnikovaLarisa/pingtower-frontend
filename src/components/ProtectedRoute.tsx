import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useResourcesStore } from '../store/resourcesStore'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, checkAuth } = useResourcesStore()

  useEffect(() => {
    // Проверяем авторизацию при монтировании компонента
    checkAuth()
  }, [checkAuth])

  // Проверяем наличие токена в localStorage
  const hasToken = localStorage.getItem('accessToken')

  if (!hasToken || !isLoggedIn) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

