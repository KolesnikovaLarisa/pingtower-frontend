import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Tab, Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { 
  User, 
  Bell, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  MessageSquare, 
  Slack, 
  Webhook,
  HelpCircle,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import Header from '../components/Header'
import { useResourcesStore } from '../store/resourcesStore'

const profileSchema = yup.object({
  name: yup.string().min(2, 'Имя должно содержать минимум 2 символа').required('Имя обязательно'),
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
})

const notificationRuleSchema = yup.object({
  service: yup.string().required('Сервис обязателен'),
  condition: yup.string().required('Условие обязательно'),
  delay: yup.number().min(0, 'Задержка не может быть отрицательной').required('Задержка обязательна'),
  interval: yup.number().min(1, 'Интервал должен быть больше 0').required('Интервал обязателен'),
})

type ProfileFormData = yup.InferType<typeof profileSchema>
type NotificationRuleFormData = yup.InferType<typeof notificationRuleSchema>

const UserCabinetPage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const { user, notificationLogs, login } = useResourcesStore()

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Иван Иванов',
      email: user?.email || 'ivan@example.com',
    },
  })

  const notificationForm = useForm<NotificationRuleFormData>({
    resolver: yupResolver(notificationRuleSchema),
    defaultValues: {
      service: '',
      condition: 'status_code_500',
      delay: 0,
      interval: 300,
    },
  })

  const [notificationChannels, setNotificationChannels] = useState({
    email: { enabled: true, token: '' },
    telegram: { enabled: false, token: '' },
    push: { enabled: false, token: '' },
    slack: { enabled: false, token: '' },
    webhook: { enabled: false, token: '' },
  })

  const [telegramModalOpen, setTelegramModalOpen] = useState(false)
  const [telegramId, setTelegramId] = useState('')
  const [telegramError, setTelegramError] = useState('')
  const [notificationRules, setNotificationRules] = useState<Array<{
    id: string
    service: string
    condition: string
    delay: number
    interval: number
  }>>([])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Обновляем пользователя в store
      login({ id: user?.id || '1', ...data })
      setIsEditing(false)
    } catch (err) {
      setError('Ошибка сохранения профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const onNotificationSubmit = async (data: NotificationRuleFormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Добавляем новое правило в список
      const newRule = {
        id: Date.now().toString(),
        ...data
      }
      setNotificationRules(prev => [newRule, ...prev])
      
      // Сбрасываем форму
      notificationForm.reset()
    } catch (err) {
      setError('Ошибка сохранения правил')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotificationRule = (ruleId: string) => {
    setNotificationRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const handleChannelToggle = (channel: keyof typeof notificationChannels) => {
    if (channel === 'telegram' && !notificationChannels.telegram.enabled) {
      // Открываем модальное окно для Telegram
      setTelegramModalOpen(true)
      setTelegramError('')
      setTelegramId('')
    } else {
      setNotificationChannels(prev => ({
        ...prev,
        [channel]: { ...prev[channel], enabled: !prev[channel].enabled }
      }))
    }
  }

  const handleTelegramConfirm = async () => {
    if (!telegramId.trim()) {
      setTelegramError('Введите tg_id')
      return
    }

    setIsLoading(true)
    setTelegramError('')
    
    try {
      // Имитация проверки tg_id с ботом
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Проверяем, что tg_id существует в базе бота
      const isValidId = Math.random() > 0.3 // Имитация проверки
      
      if (isValidId) {
        setNotificationChannels(prev => ({
          ...prev,
          telegram: { ...prev.telegram, enabled: true, token: telegramId }
        }))
        setTelegramModalOpen(false)
        setTelegramId('')
      } else {
        setTelegramError('Некорректный tg_id, проверьте, правильно ли вы его скопировали из PingTower_bot')
      }
    } catch (err) {
      setTelegramError('Ошибка проверки tg_id')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenChange = (channel: keyof typeof notificationChannels, token: string) => {
    setNotificationChannels(prev => ({
      ...prev,
      [channel]: { ...prev[channel], token }
    }))
  }

  const filteredNotificationLogs = notificationLogs.filter(log => {
    const timeMatch = timeFilter === 'all' || 
      (timeFilter === '1h' && new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000)) ||
      (timeFilter === '24h' && new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    
    const typeMatch = typeFilter === 'all' || log.type === typeFilter
    
    return timeMatch && typeMatch
  })

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'telegram':
        return <MessageSquare className="h-4 w-4" />
      case 'push':
        return <Bell className="h-4 w-4" />
      case 'slack':
        return <Slack className="h-4 w-4" />
      case 'webhook':
        return <Webhook className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'sent' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-milky">
      <Header />
      
      <div className="container py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-navyDark">Личный кабинет</h1>
          <p className="text-midGray mt-1 font-inter">Управление профилем и настройками уведомлений</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700 font-inter">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-lightGray p-1 mb-8">
            {[
              { name: 'Информация', icon: User },
              { name: 'Уведомления', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `flex items-center space-x-2 w-full rounded-lg py-2.5 text-sm font-inter font-medium leading-5 transition-all ${
                      selected
                        ? 'text-white shadow-md hover:shadow-xl bg-steelGrad' 
                        : 'text-midGray hover:text-black'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </Tab>
              )
            })}
          </Tab.List>

          <Tab.Panels>
            {/* Profile Tab */}
            <Tab.Panel>
              <div className="bg-white rounded-xl border border-lightGray/40 p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-inter font-semibold text-navyDark">Информация о профиле</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-black border border-lightGray/40 rounded-md px-4 py-2 hover:bg-silverGrad hover:brightness-110 transition-all duration-300 flex items-center space-x-2 font-inter"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Редактировать</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white text-black border border-lightGray/40 rounded-md px-4 py-2 hover:bg-silverGrad hover:brightness-110 transition-all duration-300 flex items-center space-x-2 font-inter"
                      >
                        <X className="h-4 w-4" />
                        <span>Отмена</span>
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-inter font-medium text-black">
                        Имя
                      </label>
                      <input
                        {...profileForm.register('name')}
                        type="text"
                        disabled={!isEditing}
                        className={`input mt-1 border-lightGray/60 ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                      {profileForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600 font-inter">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-inter font-medium text-black">
                        Email
                      </label>
                      <input
                        {...profileForm.register('email')}
                        type="email"
                        disabled={!isEditing}
                        className={`input mt-1 border-lightGray/60 ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                      {profileForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600 font-inter">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 text-white font-inter font-semibold px-4 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Сохранить</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </Tab.Panel>

            {/* Notifications Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* Notification Channels */}
                <div className="bg-white rounded-xl border border-lightGray/40 p-6 shadow-md">
                  <h3 className="text-lg font-inter font-semibold text-navyDark mb-6">Каналы уведомлений</h3>
                  
                  <div className="space-y-4">
                    {Object.entries(notificationChannels).map(([channel, config]) => (
                      <div key={channel} className="flex items-center justify-between p-4 border border-lightGray/40 rounded-lg hover:bg-silverGrad hover:brightness-110 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          {getChannelIcon(channel)}
                          <div>
                            <h4 className="text-sm font-inter font-medium text-black capitalize">
                              {channel === 'webhook' ? 'Webhook' : 
                               channel === 'push' ? 'Push-уведомления' : channel}
                            </h4>
                            <p className="text-xs text-midGray font-inter">
                              {channel === 'email' && 'Уведомления на email'}
                              {channel === 'telegram' && 'Telegram бот'}
                              {channel === 'push' && 'Push-уведомления в браузере'}
                              {channel === 'slack' && 'Slack интеграция'}
                              {channel === 'webhook' && 'HTTP webhook'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {config.enabled && channel !== 'push' && (
                            <input
                              type={channel === 'email' ? 'email' : 'text'}
                              placeholder={
                                channel === 'email' ? 'Email для уведомлений' :
                                channel === 'telegram' ? 'tg_id' :
                                'Токен/URL'
                              }
                              value={config.token}
                              onChange={(e) => handleTokenChange(channel as keyof typeof notificationChannels, e.target.value)}
                              className="input text-sm w-48 border-lightGray/60"
                            />
                          )}
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.enabled}
                              onChange={() => handleChannelToggle(channel as keyof typeof notificationChannels)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-grayLight peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Rules */}
                <div className="bg-white rounded-xl border border-lightGray/40 p-6 shadow-md">
                  <h3 className="text-lg font-inter font-semibold text-navyDark mb-6">Правила уведомлений</h3>
                  
                  {/* Saved Rules */}
                  {notificationRules.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-inter font-medium text-navyDark mb-4">Сохраненные правила</h4>
                      <div className="space-y-3">
                        {notificationRules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-4 border border-lightGray/40 rounded-lg bg-milky">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 text-sm font-inter">
                                <span className="text-black font-medium">Сервис: {rule.service}</span>
                                <span className="text-midGray">•</span>
                                <span className="text-black">Условие: {rule.condition}</span>
                                <span className="text-midGray">•</span>
                                <span className="text-black">Задержка: {rule.delay}с</span>
                                <span className="text-midGray">•</span>
                                <span className="text-black">Интервал: {rule.interval}с</span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteNotificationRule(rule.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-all duration-200"
                              title="Удалить правило"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create New Rule Form */}
                  <div className="border-t border-lightGray/40 pt-6">
                    <h4 className="text-md font-inter font-medium text-navyDark mb-4">Создать новое правило</h4>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label htmlFor="service" className="block text-sm font-inter font-medium text-black">
                            Сервис
                          </label>
                          <select
                            {...notificationForm.register('service')}
                            className="input mt-1 border-lightGray/60"
                          >
                            <option value="">Выберите сервис</option>
                            <option value="api-server">API Server</option>
                            <option value="web-app">Web App</option>
                            <option value="database">Database</option>
                            <option value="cache">Cache</option>
                            <option value="queue">Queue</option>
                          </select>
                          {notificationForm.formState.errors.service && (
                            <p className="mt-1 text-sm text-red-600 font-inter">
                              {notificationForm.formState.errors.service.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="condition" className="block text-sm font-inter font-medium text-black">
                            Условие
                          </label>
                          <select
                            {...notificationForm.register('condition')}
                            className="input mt-1 border-lightGray/60"
                          >
                            <option value="status_code_500">Код ответа 500</option>
                            <option value="timeout">Таймаут</option>
                            <option value="keywords">Ключевые слова</option>
                            <option value="response_time">Время отклика</option>
                          </select>
                          {notificationForm.formState.errors.condition && (
                            <p className="mt-1 text-sm text-red-600 font-inter">
                              {notificationForm.formState.errors.condition.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="delay" className="block text-sm font-inter font-medium text-black">
                            Задержка (сек)
                          </label>
                          <input
                            {...notificationForm.register('delay', { valueAsNumber: true })}
                            type="number"
                            className="input mt-1 border-lightGray/60"
                          />
                          {notificationForm.formState.errors.delay && (
                            <p className="mt-1 text-sm text-red-600 font-inter">
                              {notificationForm.formState.errors.delay.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="interval" className="block text-sm font-inter font-medium text-black">
                            Интервал (сек)
                          </label>
                          <input
                            {...notificationForm.register('interval', { valueAsNumber: true })}
                            type="number"
                            className="input mt-1 border-lightGray/60"
                          />
                          {notificationForm.formState.errors.interval && (
                            <p className="mt-1 text-sm text-red-600 font-inter">
                              {notificationForm.formState.errors.interval.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center space-x-2 text-white font-inter font-semibold px-4 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Сохранить правило</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Notification Logs */}
                <div className="bg-white rounded-xl border border-lightGray/40 p-6 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-lg font-inter font-semibold text-navyDark">Логи уведомлений</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                      <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="input text-sm border-lightGray/60"
                      >
                        <option value="all">Все время</option>
                        <option value="1h">Последний час</option>
                        <option value="24h">Последние 24 часа</option>
                      </select>
                      
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="input text-sm border-lightGray/60"
                      >
                        <option value="all">Все типы</option>
                        <option value="email">Email</option>
                        <option value="telegram">Telegram</option>
                        <option value="slack">Slack</option>
                        <option value="webhook">Webhook</option>
                      </select>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-lightGray sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                            Время
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                            Тип
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                            Сообщение
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                            Статус
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-lightGray/30">
                        {filteredNotificationLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-silverGrad hover:brightness-110 transition-all duration-300">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-inter">
                              {log.timestamp}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {getChannelIcon(log.type)}
                                <span className="text-sm text-black capitalize font-inter">{log.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-black max-w-xs truncate font-inter">
                              {log.message}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-inter font-medium ${getStatusColor(log.status)}`}>
                                {log.status === 'sent' ? 'Отправлено' : 'Ошибка'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredNotificationLogs.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="mx-auto h-8 w-8 text-midGray" />
                      <p className="mt-2 text-sm text-midGray font-inter">Логи уведомлений не найдены</p>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Telegram Confirmation Modal */}
      <Transition appear show={telegramModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setTelegramModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-inter font-medium leading-6 text-navyDark mb-4">
                    Подтвердите действие
                  </Dialog.Title>
                  
                  <div className="mb-6">
                    <p className="text-sm text-midGray font-inter mb-4">
                      Для активации Telegram уведомлений:
                    </p>
                    <ol className="text-sm text-midGray font-inter space-y-2 mb-4">
                      <li>1. Перейдите в Telegram-бота <a href="https://t.me/PingTower_bot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">@PingTower_bot</a></li>
                      <li>2. Получите ваш tg_id</li>
                      <li>3. Введите его в поле ниже</li>
                    </ol>
                    
                    <div>
                      <label htmlFor="telegramId" className="block text-sm font-inter font-medium text-black mb-1">
                        tg_id
                      </label>
                      <input
                        id="telegramId"
                        type="text"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        placeholder="Введите ваш tg_id"
                        className="input w-full border-lightGray/60"
                      />
                      {telegramError && (
                        <p className="mt-1 text-sm text-red-600 font-inter">{telegramError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setTelegramModalOpen(false)}
                      className="flex-1 bg-white text-black border border-lightGray/40 rounded-md px-4 py-2 hover:bg-silverGrad hover:brightness-110 transition-all duration-300 font-inter"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleTelegramConfirm}
                      disabled={isLoading}
                      className="flex-1 bg-steelGrad text-white rounded-md px-4 py-2 hover:brightness-110 transition-all duration-300 font-inter font-medium flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      <span>Подтвердить</span>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  )
}

export default UserCabinetPage
