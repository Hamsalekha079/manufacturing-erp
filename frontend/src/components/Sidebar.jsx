import { NavLink } from 'react-router-dom'
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
  return (
    <div className="w-64  h-auto bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Rajesh Copper</h1>
        <p className="text-gray-400 text-sm mt-1">Manufacturing ERP</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
    </div>
  )
}

export default Sidebar