import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-milky">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      
      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children ? children : <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
