import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, BarChart3, Download } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl">🧠</div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              Cognify
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/dashboard" icon={<BarChart3 size={18} />}>
              Dashboard
            </NavLink>
            <NavLink to="/interviews">
              Interviews
            </NavLink>
            <NavLink to="/progress">
              Progress
            </NavLink>
            <a
              href="https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip"
              download
              className="flex items-center space-x-1 text-gray-300 hover:text-primary-400 font-medium transition-colors"
              title="Download Extension"
            >
              <Download size={18} />
              <span>Extension</span>
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.photoURL || '/default-avatar.png'}
                alt={user?.displayName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-gray-700"
              />
              <span className="hidden md:block text-sm font-medium text-gray-200">
                {user?.displayName}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-1 text-gray-300 hover:text-primary-400 font-medium transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
