import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Plus, Search, CheckCircle, Loader2, Activity, AlertTriangle, Target } from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import Header from '../components/Header'
import ResourceTile from '../components/ResourceTile'
import { useResourcesStore } from '../store/resourcesStore'

const schema = yup.object({
  name: yup.string().required('Название обязательно'),
  url: yup.string().url('URL неверный').required('URL обязателен'),
})

type FormData = yup.InferType<typeof schema>

const ResourcesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [foundEndpoints, setFoundEndpoints] = useState<string[]>([])
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([])
  const [error, setError] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)

  const { resources, metrics: storeMetrics, addResource, removeResource, searchEndpoints: apiSearchEndpoints, loadResources } = useResourcesStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const watchedUrl = watch('url')

  // Загружаем ресурсы при монтировании компонента
  useEffect(() => {
    loadResources().catch(err => {
      console.error('Error loading resources:', err)
    })
  }, [loadResources])

  const searchEndpoints = async () => {
    if (!watchedUrl) return
    
    setIsSearching(true)
    setError('')
    
    try {
      const endpoints = await apiSearchEndpoints(watchedUrl)
      const endpointPaths = endpoints.map(ep => ep.path)
      
      setFoundEndpoints(endpointPaths)
      setSelectedEndpoints(endpointPaths) // Автоматически выбираем все
    } catch (err: any) {
      console.error('Error searching endpoints:', err)
      setError(err.response?.data?.message || 'Ошибка при поиске эндпоинтов')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleEndpoint = (endpoint: string) => {
    setSelectedEndpoints(prev => 
      prev.includes(endpoint) 
        ? prev.filter(e => e !== endpoint)
        : [...prev, endpoint]
    )
  }

  const toggleSelectAll = () => {
    if (selectedEndpoints.length === foundEndpoints.length) {
      // Если все выбраны, снимаем выделение со всех
      setSelectedEndpoints([])
    } else {
      // Если не все выбраны, выбираем все
      setSelectedEndpoints([...foundEndpoints])
    }
  }

  const onSubmit = async (data: FormData) => {
    if (selectedEndpoints.length === 0) {
      setError('Выберите хотя бы один эндпоинт')
      return
    }

    try {
      const newResource = {
        name: data.name,
        url: data.url,
        endpoints: selectedEndpoints.map(path => ({
          path,
          status: 'online' as const,
          errors24h: 0
        })),
        status: 'online' as const,
        uptime: 100,
        errors24h: 0,
        active: selectedEndpoints.length,
        sla: 100
      }

      await addResource(newResource)
      closeModal()
    } catch (err: any) {
      console.error('Error adding resource:', err)
      setError(err.response?.data?.message || 'Ошибка при добавлении ресурса')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    reset()
    setFoundEndpoints([])
    setSelectedEndpoints([])
    setError('')
  }

  const handleDeleteResource = (id: string) => {
    setResourceToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (resourceToDelete) {
      try {
        await removeResource(resourceToDelete)
        setDeleteModalOpen(false)
        setResourceToDelete(null)
      } catch (err: any) {
        console.error('Error deleting resource:', err)
        setError(err.response?.data?.message || 'Ошибка при удалении ресурса')
      }
    }
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setResourceToDelete(null)
  }

  const metrics = [
    { label: 'Uptime', value: `${storeMetrics.uptime}%`, icon: Activity, color: 'text-green-600' },
    { label: 'Сбои 24ч', value: storeMetrics.errors24h.toString(), icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Активные', value: storeMetrics.active.toString(), icon: CheckCircle, color: 'text-blue-600' },
    { label: 'SLA', value: `${storeMetrics.sla}%`, icon: Target, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-milky">
      <Header />
      
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-montserrat font-bold text-navyDark">Мои ресурсы</h1>
                <p className="text-midGray mt-1 font-inter">Управление мониторингом ваших сервисов</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 mt-4 sm:mt-0 text-white font-inter font-semibold px-4 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
              >
                <Plus size={16} />
                <span>Добавить ресурс</span>
              </button>
            </div>

            {/* Resources Grid */}
            {resources.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">☹</div>
                <h3 className="text-lg font-inter font-medium text-navyDark mb-2">Мониторить пока нечего</h3>
                <p className="text-midGray font-inter">
                  Добавьте скорее ресурс, а то мне скучно
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <ResourceTile key={resource.id} resource={resource} onDelete={handleDeleteResource} />
                ))}
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px bg-lightGray/50 mx-6"></div>

          {/* Metrics Section - Right Sidebar */}
          <div className="lg:w-40 flex-shrink-0">
            <h3 className="text-lg font-inter font-semibold text-navyDark mb-4">Метрики</h3>
            <div className="space-y-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border border-gray-500/30 p-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-steelGrad rounded-lg animate-pulse">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-inter font-medium">{metric.label}</p>
                        <p className="text-lg font-inter font-bold text-white">{metric.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Resource Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-deepNavy/50" />
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-milky p-6 text-left align-middle shadow-xl transition-all border border-lightGray/40">
                  <Dialog.Title as="h3" className="text-lg font-inter font-medium leading-6 text-black mb-4">
                    Добавить ресурс
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-inter font-medium text-black">
                        Название *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="input mt-1 border-lightGray/60"
                        placeholder="Мой сайт"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 font-inter">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="url" className="block text-sm font-inter font-medium text-black">
                        URL *
                      </label>
                      <input
                        {...register('url')}
                        type="url"
                        className="input mt-1 border-lightGray/60"
                        placeholder="https://example.com"
                      />
                      {errors.url && (
                        <p className="mt-1 text-sm text-red-600 font-inter">{errors.url.message}</p>
                      )}
                    </div>

                    {watchedUrl && (
                      <div>
                        <button
                          type="button"
                          onClick={searchEndpoints}
                          disabled={isSearching}
                          className="flex items-center space-x-2 w-full text-white font-inter font-semibold px-4 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 justify-center bg-steelGrad hover:brightness-110"
                        >
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                          <span>Поиск ресурсов</span>
                        </button>
                      </div>
                    )}

                    {foundEndpoints.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-inter font-medium text-black">
                            Найденные URL
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedEndpoints.length === foundEndpoints.length}
                              onChange={toggleSelectAll}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-lightGray rounded"
                            />
                            <span className="text-sm text-black font-inter">Выбрать все</span>
                          </label>
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-2 border border-lightGray/40 rounded-md p-2">
                          {foundEndpoints.map((endpoint) => (
                            <label key={endpoint} className="flex items-center space-x-3 p-3 border border-lightGray/40 rounded-md hover:bg-silverGrad hover:scale-102 cursor-pointer transition-all duration-300">
                              <input
                                type="checkbox"
                                checked={selectedEndpoints.includes(endpoint)}
                                onChange={() => toggleEndpoint(endpoint)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-lightGray rounded"
                              />
                              <span 
                                className="text-sm text-black font-inter truncate flex-1"
                                title={endpoint}
                              >
                                {endpoint}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-700 font-inter">{error}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-white text-black border border-lightGray/40 rounded-md px-4 py-2 hover:bg-silverGrad hover:brightness-110 transition-all duration-300 font-inter"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="flex-1 text-white font-inter font-semibold px-4 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 bg-steelGrad hover:brightness-110"
                      >
                        Начать мониторинг
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelDelete}>
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-inter font-medium leading-6 text-navyDark mb-4"
                  >
                    Подтверждение удаления
                  </Dialog.Title>
                  <div className="mb-6">
                    <p className="text-sm text-midGray font-inter">
                      Вы уверены, что хотите удалить этот ресурс? Это действие нельзя отменить.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="flex-1 bg-white text-black border border-lightGray/40 rounded-md px-4 py-2 hover:bg-silverGrad hover:brightness-110 transition-all duration-300 font-inter"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="flex-1 bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-all duration-300 font-inter font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Tooltips */}
      <Tooltip
        id="endpoint-tooltip"
        place="top"
        style={{
          backgroundColor: '#F5F5F5',
          color: '#000000',
          borderRadius: '6px',
          fontSize: '12px',
          padding: '6px 8px',
          border: '1px solid #C0C0C0',
        }}
      />
    </div>
  )
}

export default ResourcesPage
