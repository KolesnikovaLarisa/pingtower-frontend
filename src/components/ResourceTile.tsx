import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Server, X } from 'lucide-react'
import { useResourcesStore } from '../store/resourcesStore'

interface ResourceTileProps {
  resource: {
    id: string
    name: string
    status: 'online' | 'offline'
    url: string
    uptime: number
    errors24h: number
  }
  onDelete?: (id: string) => void
}

const ResourceTile = ({ resource, onDelete }: ResourceTileProps) => {
  const { removeResource } = useResourcesStore()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(resource.id)
    }
  }

  const truncateName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name
  }
  const getStatusIcon = () => {
    if (resource.status === 'online') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusColor = () => {
    return resource.status === 'online' 
      ? 'border-green-300 bg-green-50' 
      : 'border-red-300 bg-red-50'
  }

  return (
    <Link
      to={`/app/resources/${resource.id}`}
      className="block rounded-xl border border-lightGray/40 p-6 bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-steelGrad" />
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-white/60 rounded-lg group-hover:bg-white transition-colors">
            <Server className="h-5 w-5 text-navyDark group-hover:text-white transition-colors duration-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-inter font-semibold text-navyDark group-hover:text-white transition-colors duration-200 truncate">
              {truncateName(resource.name)}
            </h3>
            <p className="text-sm text-midGray truncate group-hover:text-white transition-colors duration-200 font-inter">
              {resource.url}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full border ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors duration-200"
              title="Удалить ресурс"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-midGray group-hover:text-white transition-colors duration-200 font-inter">Время работы</p>
          <p className="font-inter font-semibold text-black group-hover:text-white transition-colors duration-200">{resource.uptime}%</p>
        </div>
        <div>
          <p className="text-midGray group-hover:text-white transition-colors duration-200 font-inter">Сбои 24ч</p>
          <p className="font-inter font-semibold text-black group-hover:text-white transition-colors duration-200">{resource.errors24h}</p>
        </div>
      </div>
    </Link>
  )
}

export default ResourceTile
