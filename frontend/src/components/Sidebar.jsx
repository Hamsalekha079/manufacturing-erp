import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard, Package, Users,
  ShoppingCart, Boxes, DollarSign, Tag
} from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/materials', icon: Package, label: 'Materials' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/stock', icon: Boxes, label: 'Stock' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/products', icon: Tag, label: 'Products' },
]

function Sidebar() {
  const { auth, logout } = useApp()
  return (
    <div className="w-64 h-screen flex flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Rajesh Copper</h1>
        <p className="text-gray-400 text-sm mt-1">Manufacturing ERP</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {/* Logout */}
<div className="border-t border-gray-700 p-4">
  <div className="flex items-center gap-3 mb-3 px-2">
    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
      <span className="text-indigo-600 font-bold text-sm">A</span>
    </div>
    <div>
      <p className="text-sm font-medium text-white">{auth.username}</p>
      <p className="text-xs text-gray-400">Administrator</p>
    </div>
  </div>
  <button
    onClick={logout}
    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition"
  >
    <span>🚪</span>
    <span>Logout</span>
  </button>
</div>
    </div>
  )
}

export default Sidebar