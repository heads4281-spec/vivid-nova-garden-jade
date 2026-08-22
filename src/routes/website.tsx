import { createFileRoute } from '@tanstack/react-router'
import { Gamepad2, Users, BookOpen, HeartHandshake } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/website')' ({
  component: WebsitePage,
})

function WebsitePage() {
  return (
    <div className="w-full min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
              🎨 Vivid Nova Garden Jade
            </h1>
            <p className="text-2xl text-gray-300 mb-6">
              Transform Your Images into Stunning 3D Animated Experiences
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              The world's most advanced real-time 3D animation engine. Create, share, and compete with millions of creators worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                🚀 Launch App
              </Link>
              <Link
                to="/leaderboard"
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                🏆 View Leaderboard
              </Link>
              <Link
                to="/download"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                📱 Download App
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">✨ Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '🎭',
              title: 'Real-Time Rendering',
              description: 'Instant 3D animation from any image using advanced shaders',
            },
            {
              icon: '🌊',
              title: 'Wave Effects',
              description: 'Mesmerizing wave distortion animations with full control',
            },
            {
              icon: '✨',
              title: 'Glow & Light',
              description: 'Dynamic lighting effects and luminosity controls',
            },
            {
              icon: '🎨',
              title: 'Color Shift',
              description: 'Advanced color transformation and blending effects',
            },
            {
              icon: '360',
              title: '360° Rotation',
              description: 'Full interactive 3D model control and manipulation',
            },
            {
              icon: '📱',
              title: 'Cross-Platform',
              description: 'Seamless experience on iOS, Android, and Web',
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Optimized rendering for smooth 60+ FPS performance',
            },
            {
              icon: '🔓',
              title: 'Open Source',
              description: 'Free forever with no ads, subscriptions, or hidden costs',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900/30 to-black/50 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-16 bg-gradient-to-b from-black to-purple-900/10 rounded-xl">
        <h2 className="text-4xl font-bold text-white text-center mb-12">🎯 How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1️⃣',
              title: 'Upload or Import',
              description: 'Select any image from your device or paste a URL',
            },
            {
              step: '2️⃣',
              title: 'Instant Animation',
              description: 'Watch as we transform it into a stunning 3D model',
            },
            {
              step: '3️⃣',
              title: 'Customize & Share',
              description: 'Adjust effects, share on social media, earn points',
            },
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="text-6xl mb-4">{step.step}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Stats */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">📊 Community Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: '2.5M+', icon: '👥' },
            { label: 'Animations Created', value: '45.8M+', icon: '🎨' },
            { label: 'Daily Active Users', value: '1.2M+', icon: '⚡' },
            { label: 'Average Rating', value: '4.9/5', icon: '⭐' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-900/30 to-black/50 rounded-lg p-6 border border-purple-500/20 text-center"
            >
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">🔗 Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/"
            className="bg-gradient-to-br from-purple-900/30 to-black/50 border border-purple-500/20 rounded-lg p-8 hover:border-purple-500/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <Gamepad2 className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
              <h3 className="text-2xl font-bold text-white">Launch Web App</h3>
            </div>
            <p className="text-gray-400">Start creating 3D animations directly in your browser</p>
          </Link>

          <Link
            to="/leaderboard"
            className="bg-gradient-to-br from-yellow-900/30 to-black/50 border border-yellow-500/20 rounded-lg p-8 hover:border-yellow-500/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-yellow-400 group-hover:text-yellow-300" />
              <h3 className="text-2xl font-bold text-white">Global Leaderboard</h3>
            </div>
            <p className="text-gray-400">Compete with 2.5M+ creators and climb the global rankings</p>
          </Link>

          <Link
            to="/download"
            className="bg-gradient-to-br from-blue-900/30 to-black/50 border border-blue-500/20 rounded-lg p-8 hover:border-blue-500/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
              <h3 className="text-2xl font-bold text-white">Download App</h3>
            </div>
            <p className="text-gray-400">Get the mobile app for iOS and Android - completely free</p>
          </Link>

          <div className="bg-gradient-to-br from-green-900/30 to-black/50 border border-green-500/20 rounded-lg p-8 hover:border-green-500/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <HeartHandshake className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Community</h3>
            </div>
            <p className="text-gray-400">Join our vibrant community and share your creations</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Join millions of creators transforming images into breathtaking 3D animations
          </p>
          <Link
            to="/"
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all inline-block"
          >
            🚀 Launch Now - It's Free!
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-purple-500/20 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold text-white mb-4">🎨 Vivid Nova</h4>
              <p className="text-gray-400 text-sm">Transform images into stunning 3D animations</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Web App</Link></li>
                <li><Link to="/download" className="hover:text-white transition">Download</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-500">
            <p>© 2024 Vivid Nova Garden Jade. All rights reserved. | Free & Open Source</p>
          </div>
        </div>
      </div>
    </div>
  )
}
