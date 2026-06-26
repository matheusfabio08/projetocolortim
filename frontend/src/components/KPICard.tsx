import { LucideIcon } from 'lucide-react'

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   text: 'text-blue-700' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    text: 'text-red-700' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  text: 'text-green-700' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-700' },
}

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  subtitle?: string
}

export default function KPICard({ title, value, icon: Icon, color = 'blue', subtitle }: KPICardProps) {
  const c = colorMap[color] ?? colorMap.blue
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-4">
      <div className={`${c.bg} p-3 rounded-xl`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
