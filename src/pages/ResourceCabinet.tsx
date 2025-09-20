import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Loader2, Lightbulb, Activity, Clock, AlertTriangle, Zap, PieChart as PieChartIcon, Network, Grid3X3 } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Header from '../components/Header'
import { useResourcesStore } from '../store/resourcesStore'
import { getResourceById } from '../api/resources'

const ResourceCabinet = () => {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [checkInterval, setCheckInterval] = useState('1 ч')
  const [selectedUrl, setSelectedUrl] = useState<string>('all')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const { resources } = useResourcesStore()
  
  const resource = resources.find(r => r.id === id)

  // Метрики ресурса
  const resourceMetrics = [
    {
      label: 'Доступность',
      value: resource?.metrics?.uptime24h ? 
        parseFloat(resource.metrics.uptime24h.replace('%', '')).toFixed(1) + '%' : 
        `${resource?.uptime || 0}%`,
      icon: Activity,
      tooltip: 'Процент времени, когда сервис был доступен за последние 24 часа'
    },
    {
      label: 'Время отклика',
      value: `${resource?.metrics?.avgResponseTime || 0}мс`,
      icon: Clock,
      tooltip: 'Среднее время ответа сервера (производительность)'
    },
    {
      label: 'Частота сбоев',
      value: (resource?.metrics?.incidents24h || resource?.errors24h || 0).toString(),
      icon: AlertTriangle,
      tooltip: 'Количество инцидентов за период'
    },
    {
      label: 'MTTR',
      value: 'N/A', // Пока не реализовано
      icon: Zap,
      tooltip: 'Среднее время от алерта до восстановления'
    }
  ]

  // Интервалы проверки ресурса
  const checkIntervals = [
    '30 мин',
    '1 ч', 
    '2 ч',
    '3 ч',
    '6 ч',
    '12 ч',
    '24 ч',
    '48 ч',
    '72 ч'
  ]

  // Расширенный список эндпоинтов для демонстрации прокрутки
  const extendedEndpoints = [
    ...(resource?.endpoints || []),
    { path: '/api/users/profile/settings/notifications', status: 'online' as const, errors24h: 0 },
    { path: '/api/products/categories/subcategories/items/details', status: 'online' as const, errors24h: 1 },
    { path: '/api/orders/history/payments/transactions/refunds', status: 'offline' as const, errors24h: 3 },
    { path: '/api/analytics/dashboard/reports/export/data', status: 'online' as const, errors24h: 0 },
    { path: '/api/admin/users/roles/permissions/access-control', status: 'online' as const, errors24h: 2 },
    { path: '/api/integrations/third-party/webhooks/callbacks', status: 'offline' as const, errors24h: 5 },
    { path: '/api/monitoring/health-checks/status/alerts', status: 'online' as const, errors24h: 0 },
    { path: '/api/authentication/oauth/providers/tokens/refresh', status: 'online' as const, errors24h: 1 },
    { path: '/api/content-management/pages/templates/assets/uploads', status: 'offline' as const, errors24h: 4 },
    { path: '/api/customer-support/tickets/attachments/responses', status: 'online' as const, errors24h: 0 },
    { path: '/api/billing/subscriptions/plans/features/usage', status: 'online' as const, errors24h: 1 },
    { path: '/api/security/audit-logs/compliance/reports/export', status: 'offline' as const, errors24h: 2 }
  ]

  // Mock данные для графика сбоев
  const errorChartData = [
    { time: '12:00', errors: 1 },
    { time: '13:00', errors: 0 },
    { time: '14:00', errors: 2 },
    { time: '15:00', errors: 0 },
    { time: '16:00', errors: 1 },
    { time: '17:00', errors: 0 },
    { time: '18:00', errors: 3 },
    { time: '19:00', errors: 0 },
    { time: '20:00', errors: 1 },
    { time: '21:00', errors: 0 },
  ]

  // Данные для графика Response Time
  const responseTimeData = [
    { time: '00:00', responseTime: 120 },
    { time: '02:00', responseTime: 95 },
    { time: '04:00', responseTime: 110 },
    { time: '06:00', responseTime: 150 },
    { time: '08:00', responseTime: 200 },
    { time: '10:00', responseTime: 180 },
    { time: '12:00', responseTime: 220 },
    { time: '14:00', responseTime: 190 },
    { time: '16:00', responseTime: 210 },
    { time: '18:00', responseTime: 250 },
    { time: '20:00', responseTime: 180 },
    { time: '22:00', responseTime: 140 },
  ]

  // Данные для круговой диаграммы типов ошибок
  const failureTypesData = [
    { name: 'Critical', value: 15, color: '#8B0000' }, // бордовый
    { name: 'Warning', value: 25, color: '#B8860B' }, // тёмно-оранжевый
    { name: 'Resolved', value: 60, color: '#2D5016' }, // тёмно-зелёный
  ]

  // Данные для тепловой карты сбоев по дням недели за последние 14 дней
  const weeklyHeatmapDataByUrl = {
    all: [
      { day: 'Пн', date: '2024-01-01', errors: 2, status: 'warning' },
      { day: 'Вт', date: '2024-01-02', errors: 1, status: 'warning' },
      { day: 'Ср', date: '2024-01-03', errors: 0, status: 'operational' },
      { day: 'Чт', date: '2024-01-04', errors: 3, status: 'warning' },
      { day: 'Пт', date: '2024-01-05', errors: 1, status: 'warning' },
      { day: 'Сб', date: '2024-01-06', errors: 0, status: 'operational' },
      { day: 'Вс', date: '2024-01-07', errors: 0, status: 'operational' },
      { day: 'Пн', date: '2024-01-08', errors: 4, status: 'critical' },
      { day: 'Вт', date: '2024-01-09', errors: 2, status: 'warning' },
      { day: 'Ср', date: '2024-01-10', errors: 1, status: 'warning' },
      { day: 'Чт', date: '2024-01-11', errors: 0, status: 'operational' },
      { day: 'Пт', date: '2024-01-12', errors: 3, status: 'warning' },
      { day: 'Сб', date: '2024-01-13', errors: 0, status: 'operational' },
      { day: 'Вс', date: '2024-01-14', errors: 1, status: 'warning' },
    ],
    'api/users': [
      { day: 'Пн', date: '2024-01-01', errors: 1, status: 'warning' },
      { day: 'Вт', date: '2024-01-02', errors: 0, status: 'operational' },
      { day: 'Ср', date: '2024-01-03', errors: 0, status: 'operational' },
      { day: 'Чт', date: '2024-01-04', errors: 2, status: 'warning' },
      { day: 'Пт', date: '2024-01-05', errors: 1, status: 'warning' },
      { day: 'Сб', date: '2024-01-06', errors: 0, status: 'operational' },
      { day: 'Вс', date: '2024-01-07', errors: 0, status: 'operational' },
      { day: 'Пн', date: '2024-01-08', errors: 3, status: 'critical' },
      { day: 'Вт', date: '2024-01-09', errors: 1, status: 'warning' },
      { day: 'Ср', date: '2024-01-10', errors: 0, status: 'operational' },
      { day: 'Чт', date: '2024-01-11', errors: 0, status: 'operational' },
      { day: 'Пт', date: '2024-01-12', errors: 2, status: 'warning' },
      { day: 'Сб', date: '2024-01-13', errors: 0, status: 'operational' },
      { day: 'Вс', date: '2024-01-14', errors: 0, status: 'operational' },
    ],
    'api/auth': [
      { day: 'Пн', date: '2024-01-01', errors: 0, status: 'operational' },
      { day: 'Вт', date: '2024-01-02', errors: 1, status: 'warning' },
      { day: 'Ср', date: '2024-01-03', errors: 0, status: 'operational' },
      { day: 'Чт', date: '2024-01-04', errors: 1, status: 'warning' },
      { day: 'Пт', date: '2024-01-05', errors: 0, status: 'operational' },
      { day: 'Сб', date: '2024-01-06', errors: 0, status: 'operational' },
      { day: 'Вс', date: '2024-01-07', errors: 0, status: 'operational' },
      { day: 'Пн', date: '2024-01-08', errors: 1, status: 'warning' },
      { day: 'Вт', date: '2024-01-09', errors: 1, status: 'warning' },
      { day: 'Ср', date: '2024-01-10', errors: 1, status: 'warning' },
      { day: 'Чт', date: '2024-01-11', errors: 0, status: 'operational' },
      { day: 'Пт', date: '2024-01-12', errors: 1, status: 'warning' },
      { day: 'Сб', date: '2024-01-13', errors: 0, status: 'operational' },
      { day: 'Вс', date: '2024-01-14', errors: 1, status: 'warning' },
    ],
  }

  // Данные для детализации по часам для выбранного дня
  const hourlyDetailDataByUrl = {
    all: {
      '2024-01-01': [
        { hour: 0, errors: 0, status: 'operational' },
        { hour: 6, errors: 1, status: 'warning' },
        { hour: 12, errors: 1, status: 'warning' },
        { hour: 18, errors: 0, status: 'operational' },
      ],
      '2024-01-08': [
        { hour: 0, errors: 1, status: 'warning' },
        { hour: 6, errors: 2, status: 'critical' },
        { hour: 12, errors: 1, status: 'warning' },
        { hour: 18, errors: 0, status: 'operational' },
      ],
    },
    'api/users': {
      '2024-01-01': [
        { hour: 0, errors: 0, status: 'operational' },
        { hour: 6, errors: 0, status: 'operational' },
        { hour: 12, errors: 1, status: 'warning' },
        { hour: 18, errors: 0, status: 'operational' },
      ],
      '2024-01-08': [
        { hour: 0, errors: 1, status: 'warning' },
        { hour: 6, errors: 1, status: 'warning' },
        { hour: 12, errors: 1, status: 'warning' },
        { hour: 18, errors: 0, status: 'operational' },
      ],
    },
    'api/auth': {
      '2024-01-01': [
        { hour: 0, errors: 0, status: 'operational' },
        { hour: 6, errors: 0, status: 'operational' },
        { hour: 12, errors: 0, status: 'operational' },
        { hour: 18, errors: 0, status: 'operational' },
      ],
      '2024-01-08': [
        { hour: 0, errors: 0, status: 'operational' },
        { hour: 6, errors: 1, status: 'warning' },
        { hour: 12, errors: 0, status: 'operational' },
        { hour: 18, errors: 0, status: 'operational' },
      ],
    },
  }

  // Получаем данные для выбранного URL
  const currentWeeklyData = weeklyHeatmapDataByUrl[selectedUrl as keyof typeof weeklyHeatmapDataByUrl] || weeklyHeatmapDataByUrl.all

  // Данные для карты зависимостей (корреляция между URL)
  const dependencyData = [
    { url1: 'api/users', url2: 'api/users', correlation: 1.0 },
    { url1: 'api/users', url2: 'api/auth', correlation: 0.8 },
    { url1: 'api/users', url2: 'api/orders', correlation: 0.6 },
    { url1: 'api/users', url2: 'api/products', correlation: 0.3 },
    { url1: 'api/auth', url2: 'api/users', correlation: 0.8 },
    { url1: 'api/auth', url2: 'api/auth', correlation: 1.0 },
    { url1: 'api/auth', url2: 'api/orders', correlation: 0.7 },
    { url1: 'api/auth', url2: 'api/products', correlation: 0.2 },
    { url1: 'api/orders', url2: 'api/users', correlation: 0.6 },
    { url1: 'api/orders', url2: 'api/auth', correlation: 0.7 },
    { url1: 'api/orders', url2: 'api/orders', correlation: 1.0 },
    { url1: 'api/orders', url2: 'api/products', correlation: 0.9 },
    { url1: 'api/products', url2: 'api/users', correlation: 0.3 },
    { url1: 'api/products', url2: 'api/auth', correlation: 0.2 },
    { url1: 'api/products', url2: 'api/orders', correlation: 0.9 },
    { url1: 'api/products', url2: 'api/products', correlation: 1.0 },
  ]

  // Функция для определения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return '#2D5016' // тёмно-зелёный
      case 'warning':
        return '#B8860B' // тёмно-оранжевый
      case 'critical':
        return '#8B0000' // бордовый
      default:
        return '#2D5016'
    }
  }

  // Функция для обработки клика по дню
  const handleDayClick = (date: string) => {
    setSelectedDay(selectedDay === date ? null : date)
  }

  // Получаем данные для детализации по часам
  const getHourlyData = () => {
    if (!selectedDay) return []
    const urlData = hourlyDetailDataByUrl[selectedUrl as keyof typeof hourlyDetailDataByUrl]
    return urlData?.[selectedDay as keyof typeof urlData] || []
  }

  useEffect(() => {
    const loadResourceData = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        // Если ресурс не найден в store, загружаем его с сервера
        if (!resource) {
          await getResourceById(id)
          // Обновляем store с полученными данными
          // Здесь можно добавить логику обновления store
        }
      } catch (error) {
        console.error('Error loading resource:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResourceData()
  }, [id, resource])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-milky">
        <Header />
        <div className="container py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-navyDark" />
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-milky">
        <Header />
        <div className="container py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-montserrat font-bold text-navyDark mb-4">Ресурс не найден</h1>
            <Link to="/app/resources" className="btn-primary">
              Вернуться к ресурсам
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: 'online' | 'offline') => {
    if (status === 'online') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusTooltip = (status: 'online' | 'offline') => {
    return status === 'online' ? 'Доступен' : 'Сбой'
  }

  return (
    <div className="min-h-screen bg-milky">
      <Header />
      
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/app/resources"
              className="p-2 rounded-md hover:bg-silverGrad hover:brightness-110 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-midGray" />
            </Link>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-navyDark">{resource.name}</h1>
              <p className="text-midGray font-inter">{resource.url}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/*<span className="text-sm text-midGray font-inter">Интервал проверки:</span>*/}
            <select
              value={checkInterval}
              onChange={(e) => setCheckInterval(e.target.value)}
              className="px-3 py-2 border border-lightGray/50 rounded-md focus:outline-none focus:ring-2 focus:ring-midGray focus:border-transparent bg-white text-black font-inter text-sm"
              data-tooltip-id="interval-tooltip"
              data-tooltip-content="Выберите интервал проверки ресурса"
            >
              {checkIntervals.map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resource Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {resourceMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border border-gray-500/30 p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                data-tooltip-id={`resource-metric-tooltip-${index}`}
                data-tooltip-content={metric.tooltip}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-steelGrad rounded-lg animate-pulse">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-inter font-medium">{metric.label}</p>
                    <p className="text-lg font-inter font-bold text-white">{metric.value}</p>
                  </div>
                </div>
                <ReactTooltip 
                  id={`resource-metric-tooltip-${index}`} 
                  place="top"
                  style={{ zIndex: 1000 }}
                />
              </div>
            )
          })}
        </div>

        {/* Error Chart */}
        <div className="chart-container mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-inter font-semibold text-navyDark">График сбоев</h2>
            <div className="flex items-center space-x-2 text-sm text-midGray font-inter">
              <Lightbulb className="h-4 w-4 text-navyDark" />
              <span>График показывает тренд сбоев — низкий = всё ок</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={errorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#A9A9A9" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#000000"
                  fontSize={12}
                  fontFamily="Inter"
                />
                <YAxis 
                  stroke="#000000"
                  fontSize={12}
                  fontFamily="Inter"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F5F5F5',
                    border: '1px solid #C0C0C0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#000000',
                    fontFamily: 'Inter',
                  }}
                  labelFormatter={(value) => `Время: ${value}`}
                  formatter={(value) => [`${value} сбоев`, 'Сбоев за час']}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="url(#steelGradient)"
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={(() => {
                          const errors = payload?.errors || 0
                          if (errors > 2) return '#8B0000' // бордовый
                          if (errors > 0) return '#B8860B' // тёмно-оранжевый
                          return '#2D5016' // тёмно-зелёный
                        })()}
                        stroke="#C0C0C0"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={(props: any) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill={(() => {
                          const errors = payload?.errors || 0
                          if (errors > 2) return '#8B0000' // бордовый
                          if (errors > 0) return '#B8860B' // тёмно-оранжевый
                          return '#2D5016' // тёмно-зелёный
                        })()}
                        stroke="#C0C0C0"
                        strokeWidth={2}
                        filter="brightness(1.2)"
                      />
                    )
                  }}
                  strokeDasharray="0"
                  animationDuration={1000}
                />
                <defs>
                  <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#808080" />
                    <stop offset="100%" stopColor="#43464B" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Легенда цветовой шкалы */}
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm font-inter">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2D5016' }}></div>
              <span className="text-midGray">Мало сбоев</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B8860B' }}></div>
              <span className="text-midGray">Средние сбои</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B0000' }}></div>
              <span className="text-midGray">Много сбоев</span>
            </div>
          </div>
        </div>

        {/* Новые графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* График Response Time */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-inter font-semibold text-navyDark">Response Time</h2>
              <div className="flex items-center space-x-2 text-sm text-midGray font-inter">
                <Clock className="h-4 w-4 text-navyDark" />
                <span>Время ответа сервера</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#A9A9A9" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#000000"
                    fontSize={12}
                    fontFamily="Inter"
                  />
                  <YAxis 
                    stroke="#000000"
                    fontSize={12}
                    fontFamily="Inter"
                    label={{ value: 'мс', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #C0C0C0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#000000',
                      fontFamily: 'Inter',
                    }}
                    labelFormatter={(value) => `Время: ${value}`}
                    formatter={(value) => [`${value}мс`, 'Время ответа']}
                  />
                  <ReferenceLine y={100} stroke="#B8860B" strokeDasharray="5 5" label="Warning (100ms)" />
                  <ReferenceLine y={300} stroke="#8B0000" strokeDasharray="5 5" label="Critical (300ms)" />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="url(#steelGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#43464B', strokeWidth: 2, r: 4 }}
                  />
                  <defs>
                    <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#808080" />
                      <stop offset="100%" stopColor="#43464B" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Круговая диаграмма типов ошибок */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-inter font-semibold text-navyDark">Failures by Types</h2>
              <div className="flex items-center space-x-2 text-sm text-midGray font-inter">
                <PieChartIcon className="h-4 w-4 text-navyDark" />
                <span>Распределение по типам</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={failureTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {failureTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #C0C0C0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#000000',
                      fontFamily: 'Inter',
                    }}
                    formatter={(value, name) => [`${value}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Тепловая карта сбоев по дням недели */}
        <div className="chart-container mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-inter font-semibold text-navyDark">Тепловая карта сбоев - Последние 14 дней</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-midGray font-inter">URL:</label>
                <select 
                  value={selectedUrl} 
                  onChange={(e) => setSelectedUrl(e.target.value)}
                  className="px-3 py-1 border border-lightGray/40 rounded-lg text-sm font-inter bg-white text-navyDark focus:outline-none focus:ring-2 focus:ring-steelGrad"
                >
                  <option value="all">Все URL</option>
                  <option value="api/users">api/users</option>
                  <option value="api/auth">api/auth</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-midGray font-inter">
                <Grid3X3 className="h-4 w-4 text-navyDark" />
                <span>Нажмите на день для детализации по часам</span>
              </div>
            </div>
          </div>
          
          {/* Легенда */}
          <div className="flex items-center justify-end space-x-4 mb-4 text-sm font-inter">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2D5016' }}></div>
              <span className="text-midGray">Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#B8860B' }}></div>
              <span className="text-midGray">Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8B0000' }}></div>
              <span className="text-midGray">Critical</span>
            </div>
          </div>

          {/* Тепловая карта */}
          <div className="bg-white rounded-lg p-4 border border-lightGray/40">
            <div className="grid grid-cols-14 gap-1 mb-2">
              {currentWeeklyData.map((dayData, index) => (
                <div
                  key={index}
                  className="aspect-square rounded cursor-pointer hover:ring-2 hover:ring-steelGrad transition-all duration-200 flex items-center justify-center text-xs font-inter font-medium text-white"
                  style={{ backgroundColor: getStatusColor(dayData.status) }}
                  onClick={() => handleDayClick(dayData.date)}
                  title={`${dayData.day} ${dayData.date}: ${dayData.errors} сбоев`}
                >
                  {dayData.errors}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-midGray font-inter">
              <span>14 дней назад</span>
              <span>Сегодня</span>
            </div>
          </div>

          {/* Детализация по часам */}
          {selectedDay && (
            <div className="mt-6 bg-white rounded-lg p-4 border border-lightGray/40">
              <h3 className="text-md font-inter font-semibold text-navyDark mb-4">
                Детализация по часам - {selectedDay}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {getHourlyData().map((hourData, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded flex items-center justify-center text-sm font-inter font-medium text-white"
                    style={{ backgroundColor: getStatusColor(hourData.status) }}
                    title={`${hourData.hour}:00 - ${hourData.errors} сбоев`}
                  >
                    {hourData.hour}:00
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-midGray font-inter mt-2">
                <span>00:00</span>
                <span>18:00</span>
              </div>
            </div>
          )}
        </div>

        {/* Карта зависимостей */}
        <div className="chart-container mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-inter font-semibold text-navyDark">Карта зависимостей</h2>
            <div className="flex items-center space-x-2 text-sm text-midGray font-inter">
              <Network className="h-4 w-4 text-navyDark" />
              <span>Корреляция между URL</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dependencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#A9A9A9" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="url1" 
                  stroke="#000000"
                  fontSize={10}
                  fontFamily="Inter"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  dataKey="url2"
                  stroke="#000000"
                  fontSize={10}
                  fontFamily="Inter"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F5F5F5',
                    border: '1px solid #C0C0C0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#000000',
                    fontFamily: 'Inter',
                  }}
                  labelFormatter={(_value: any, payload: any) => {
                    const data = payload?.[0]?.payload;
                    return `${data?.url1} ↔ ${data?.url2}`;
                  }}
                  formatter={(value: any) => [`${(value * 100).toFixed(0)}%`, 'Корреляция']}
                />
                <Bar 
                  dataKey="correlation" 
                  fill="#6B7280"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="bg-white rounded-xl border border-lightGray/40 overflow-hidden shadow-md">
          <div className="px-6 py-4 border-b border-lightGray/40">
            <h2 className="text-lg font-inter font-semibold text-navyDark">URL</h2>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-lightGray sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                    Индикатор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                    Сбои 24ч
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-lightGray/30">
                {extendedEndpoints.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-silverGrad hover:brightness-110 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm font-inter font-medium text-black truncate max-w-xs"
                        title={endpoint.path}
                      >
                        {endpoint.path}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          data-tooltip-id="status-tooltip"
                          data-tooltip-content={getStatusTooltip(endpoint.status)}
                        >
                          {getStatusIcon(endpoint.status)}
                        </div>
                        <span className="text-sm text-midGray font-inter">
                          {endpoint.status === 'online' ? 'Доступен' : 'Сбой'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-inter font-medium ${
                        endpoint.errors24h === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {endpoint.errors24h}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Tooltips */}
      <ReactTooltip
        id="status-tooltip"
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
      <ReactTooltip
        id="interval-tooltip"
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

export default ResourceCabinet
