import { Link } from 'react-router-dom'
import { 
  Link as LinkIcon, 
  Clock, 
  Database, 
  Globe, 
  Bell, 
  FileText,
  Shield,
  ArrowRight
} from 'lucide-react'
import { Tooltip } from 'react-tooltip'

const HomePage = () => {
  const features = [
    {
      icon: LinkIcon,
      title: 'Автопарсинг эндпоинтов',
      description: 'Автоматическое обнаружение и мониторинг API эндпоинтов вашего приложения',
      tooltip: 'Система автоматически находит все доступные API точки и добавляет их в мониторинг'
    },
    {
      icon: Clock,
      title: 'Планировщик проверок',
      description: 'Гибкая настройка частоты проверок от секунд до часов',
      tooltip: 'Настройте интервалы проверки для каждого ресурса индивидуально'
    },
    {
      icon: Database,
      title: 'Хранилище результатов',
      description: 'Долгосрочное хранение метрик производительности и истории',
      tooltip: 'Все данные о производительности сохраняются для анализа трендов'
    },
    {
      icon: Globe,
      title: 'REST API и веб-интерфейс',
      description: 'Полноценный API для интеграций и удобный веб-интерфейс',
      tooltip: 'Интегрируйте мониторинг в ваши системы через API'
    },
    {
      icon: Bell,
      title: 'Оповещения',
      description: 'Мгновенные уведомления о проблемах через email, SMS, Telegram',
      tooltip: 'Получайте уведомления о сбоях в реальном времени'
    },
    {
      icon: FileText,
      title: 'Отчеты и история',
      description: 'Детальные отчеты о доступности и производительности',
      tooltip: 'Анализируйте статистику работы ваших сервисов'
    }
  ]

  return (
    <div className="min-h-screen bg-milky">
      {/* Hero Section */}
      <section className="relative py-20 md:py-24 bg-silverGrad overflow-hidden">
        {/* SVG wave / metallic highlight */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" aria-hidden>
          <path fill="url(#metal)" fillOpacity="0.35" d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,69.3C672,64,768,64,864,90.7C960,117,1056,171,1152,186.7C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          <defs>
            <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9BA8AB" />
              <stop offset="100%" stopColor="#CCD0CF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative container">
          <div className="text-center max-w-4xl mx-auto animate-fadeIn">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-black mb-6 leading-tight">
              PingTower: сервисы под присмотром
            </h1>
            <p className="text-lg md:text-xl text-black/80 mb-10 max-w-2xl mx-auto font-inter">
              Круглосуточный мониторинг сайтов и API с понятными отчетами и мгновенными уведомлениями
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center space-x-2 text-white font-inter font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
            >
              <span>Начать мониторинг</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-milky">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-lightGray/30 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden"
                  data-tooltip-id="feature-tooltip"
                  data-tooltip-content={feature.tooltip}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-steelGrad" />
                  <div className="flex items-center space-x-4 mb-4 relative">
                    <div className="p-3 bg-milky rounded-lg group-hover:bg-white transition-colors duration-200">
                      <Icon className="h-6 w-6 text-navyDark group-hover:text-white transition-colors duration-200" />
                    </div>
                    <h3 className="text-lg font-inter font-semibold text-navyDark group-hover:text-white transition-colors duration-200">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-midGray leading-relaxed group-hover:text-white transition-colors duration-200">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-montserrat font-bold text-navyDark mb-6">
              Готовы начать мониторинг?
            </h2>
            <p className="text-lg text-midGray mb-8 font-inter">
              Присоединяйтесь к тысячам разработчиков, которые доверяют PingTower мониторинг своих сервисов
            </p>
            <div className="flex justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center space-x-2 text-white font-inter font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
              >
                <span>Создать аккаунт</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-steelGrad text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-white" />
              <span className="font-inter">Безопасность: сквозное шифрование</span>
            </div>
            <div className="text-sm font-inter">
              © 2025 PingTower. Все права защищены. • <a href="mailto:support@pingtower.app" className="underline hover:text-lightGray transition-colors">support@pingtower.app</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Tooltip */}
      <Tooltip
        id="feature-tooltip"
        place="top"
        style={{
          backgroundColor: '#F5F5F5',
          color: '#000000',
          borderRadius: '8px',
          fontSize: '14px',
          padding: '8px 12px',
          maxWidth: '300px',
          border: '1px solid #C0C0C0',
        }}
      />
    </div>
  )
}

export default HomePage
