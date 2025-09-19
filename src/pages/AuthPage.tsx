import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Loader2,
  Github,
  Chrome,
  HelpCircle,
  AlertCircle
} from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import { useResourcesStore } from '../store/resourcesStore'
import { loginUser, registerUser } from "../api/auth.ts";

// Схемы валидации
const loginSchema = yup.object({
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  password: yup.string().min(6, 'Пароль должен содержать минимум 6 символов').required('Пароль обязателен'),
})

const registerSchema = yup.object({
  name: yup.string().min(2, 'Имя должно содержать минимум 2 символа').required('Имя обязательно'),
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  password: yup.string().min(6, 'Пароль должен содержать минимум 6 символов').required('Пароль обязателен'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Пароли не совпадают').required('Подтверждение пароля обязательно'),
})

type LoginFormData = yup.InferType<typeof loginSchema>
type RegisterFormData = yup.InferType<typeof registerSchema>

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // Instance selector is not needed
  
  const navigate = useNavigate()
  const { login } = useResourcesStore()

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setIsLoading(true);
    setError("");
  
    try {
      let response;
      if (isLogin) {
        // вход
        response = await loginUser(data.email, data.password);
      } else {
        // регистрация
        const regData = data as RegisterFormData;
        response = await registerUser(regData.email, regData.password, regData.name);
      }
  
      // обновляем стор с данными пользователя
      login(response.user);
  
      navigate("/app");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || err.message || "Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    console.log(`OAuth login with ${provider}`)
    // Здесь будет логика OAuth
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError('')
    loginForm.reset()
    registerForm.reset()
  }

  // instances removed

  return (
    <div className="min-h-screen bg-milky flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-montserrat font-bold text-navyDark">
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </h2>
          <p className="mt-2 text-sm text-midGray font-inter">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              type="button"
              onClick={toggleForm}
              className="font-inter font-medium text-navyDark hover:text-black underline underline-offset-4 transition-colors"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>

        {/* Instance selector removed */}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700 font-inter">{error}</span>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-inter font-medium text-black">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-midGray" />
                  </div>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-10 py-2 border border-lightGray/60 rounded-md focus:outline-none focus:ring-2 focus:ring-navyDark focus:border-transparent bg-milky text-black font-inter"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <HelpCircle 
                      className="h-4 w-4 text-midGray cursor-help"
                      data-tooltip-id="email-tooltip"
                      data-tooltip-content="Зачем email? Для уведомлений"
                    />
                  </div>
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 font-inter">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-inter font-medium text-black">
                  Пароль
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-midGray" />
                  </div>
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-lightGray/60 rounded-md focus:outline-none focus:ring-2 focus:ring-navyDark focus:border-transparent bg-milky text-black font-inter"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-midGray" />
                    ) : (
                      <Eye className="h-5 w-5 text-midGray" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 font-inter">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-lightGray rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-black font-inter">
                  Запомнить меня
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-inter font-medium text-blue-600 hover:text-blue-500">
                  Восстановить пароль
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-inter font-semibold rounded-md text-white transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-steelGrad hover:brightness-110"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Войти'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form className="mt-8 space-y-6" onSubmit={registerForm.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-inter font-medium text-black">
                  Имя
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-midGray" />
                  </div>
                  <input
                    {...registerForm.register('name')}
                    type="text"
                    className="w-full pl-10 py-2 border border-lightGray/60 rounded-md focus:outline-none focus:ring-2 focus:ring-navyDark focus:border-transparent bg-milky text-black font-inter"
                    placeholder="Ваше имя"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600 font-inter">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-inter font-medium text-black">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-midGray" />
                  </div>
                  <input
                    {...registerForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-10 py-2 border border-lightGray/60 rounded-md focus:outline-none focus:ring-2 focus:ring-navyDark focus:border-transparent bg-milky text-black font-inter"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <HelpCircle 
                      className="h-4 w-4 text-midGray cursor-help"
                      data-tooltip-id="email-tooltip"
                      data-tooltip-content="Зачем email? Для уведомлений"
                    />
                  </div>
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 font-inter">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-inter font-medium text-black">
                  Пароль
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-midGray" />
                  </div>
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-lightGray/60 rounded-md focus:outline-none focus:ring-2 focus:ring-navyDark focus:border-transparent bg-milky text-black font-inter"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-midGray" />
                    ) : (
                      <Eye className="h-5 w-5 text-midGray" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 font-inter">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-inter font-medium text-black">
                  Подтвердите пароль
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-midGray" />
                  </div>
                  <input
                    {...registerForm.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-lightGray/60 rounded-md focus:outline-none focus:ring-2 focus:ring-navyDark focus:border-transparent bg-milky text-black font-inter"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-midGray" />
                    ) : (
                      <Eye className="h-5 w-5 text-midGray" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 font-inter">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-inter font-semibold rounded-md text-white transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-steelGrad hover:brightness-110"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            </div>
          </form>
        )}

        {/* OAuth Buttons */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-grayLight" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-milky text-grayText">Или войдите через</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-lightGray/40 rounded-md shadow-sm bg-white text-sm font-inter font-medium text-midGray hover:bg-silverGrad hover:brightness-110 transition-all duration-300"
            >
              <Chrome className="h-5 w-5" />
              <span className="ml-2">Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              className="w-full inline-flex justify-center py-2 px-4 border border-lightGray/40 rounded-md shadow-sm bg-white text-sm font-inter font-medium text-midGray hover:bg-silverGrad hover:brightness-110 transition-all duration-300"
            >
              <Github className="h-5 w-5" />
              <span className="ml-2">GitHub</span>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm font-inter font-medium text-navyDark hover:text-black underline underline-offset-4 transition-colors"
          >
            На главную страницу
          </Link>
        </div>
      </div>

      {/* Tooltip */}
      <Tooltip
        id="email-tooltip"
        place="top"
        style={{
          backgroundColor: '#F5F5F5',
          color: '#000000',
          borderRadius: '6px',
          fontSize: '12px',
          padding: '6px 8px',
          border: '1px solid #C0C0C0',
          fontFamily: 'Inter',
        }}
      />
    </div>
  )
}

export default AuthPage
