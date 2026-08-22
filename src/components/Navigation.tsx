import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Menu, Settings, Home, Trophy, Download, Zap } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/__root')' ({
  component: Layout,
})

function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Gallery', icon: Zap, href: '/gallery' },
    { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { label: 'Download', icon: Download, href: '/download' },
    { label: 'Website', icon: Settings, href: '/website' },
  ]

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Navigation Header */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/website" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-3xl">🎨</span>
            <span className="text-xl font-bold text-white">Vivid Nova</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition font-medium"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-purple-400 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 border-t border-purple-500/20 px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition font-medium py-2"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="w-full">{/* Routes will render here */}</div>
    </div>
  )
}
