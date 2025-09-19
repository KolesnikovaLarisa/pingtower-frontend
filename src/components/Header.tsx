import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import { useResourcesStore } from '../store/resourcesStore'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isLoggedIn, user, logout } = useResourcesStore()

  const navigation = [
    { name: 'Мои ресурсы', href: '/app/resources' },
    { name: 'Наблюдения', href: '/app/observations' },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-milky/90 backdrop-blur border-b border-lightGray/90 shadow-md">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-montserrat font-bold bg-silverGrad bg-clip-text text-transparent">
                PingTower
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-inter font-medium transition-all duration-300 rounded-md underline-offset-4 ${
                      isActive ? 'text-navyDark' : 'text-midGray hover:text-black hover:underline'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <NavLink
                    to="/app/cabinet"
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-midGray/20 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-midGray/30 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-navyDark" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name || 'Личный кабинет'}
                    </span>
                  </NavLink>
                  <button
                    onClick={async () => {
                      await logout()
                    }}
                    className="text-sm text-midGray hover:text-darkGray transition-colors"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  className="px-4 py-2 text-sm font-inter font-semibold text-white rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
                >
                  Вход
                </NavLink>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-grayText hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              aria-label="Открыть меню"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-milky border-t border-lightGray/40 shadow-lg">
            <div className="container py-4">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 text-base font-inter font-medium transition-colors duration-200 rounded-md ${
                        isActive ? 'text-navyDark' : 'text-midGray hover:text-black'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-grayLight">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <NavLink
                        to="/app/cabinet"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-midGray hover:text-darkGray transition-colors duration-200 rounded-md"
                      >
                        <div className="w-8 h-8 bg-midGray/30 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-navyDark" />
                        </div>
                        <span>{user?.name || 'Личный кабинет'}</span>
                      </NavLink>
                      <button
                        onClick={async () => {
                          await logout()
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-center px-4 py-2 text-base font-medium text-midGray hover:text-darkGray transition-colors duration-200 rounded-md"
                      >
                        Выйти
                      </button>
                    </div>
                  ) : (
                    <NavLink
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center px-4 py-2 text-base font-inter font-semibold text-white rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
                    >
                      Вход
                    </NavLink>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

    </>
  )
}

export default Header
