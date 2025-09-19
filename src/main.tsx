import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './globals.css'
import { useResourcesStore } from './store/resourcesStore'

// Инициализируем авторизацию при загрузке приложения
const initializeAuth = () => {
  const { checkAuth } = useResourcesStore.getState()
  checkAuth()
}

// Вызываем инициализацию авторизации
initializeAuth()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

