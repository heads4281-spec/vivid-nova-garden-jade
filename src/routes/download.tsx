import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Download, Apple, Smartphone } from 'lucide-react'

export const Route = createFileRoute('/download')' ({
  component: DownloadPage,
})

function DownloadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'web' | null>(null)

  const platforms = [
    {
      id: 'ios',
      name: 'App Store',
      icon: <Apple className="w-12 h-12" />,
      description: 'Download for iPhone & iPad',
      color: 'from-gray-900 to-black',
      link: 'https://apps.apple.com/vivid-nova-garden-jade',
      badge: '★★★★★ 4.8',
    },
    {
      id: 'android',
      name: 'Google Play',
      icon: <Smartphone className="w-12 h-12" />,
      description: 'Download for Android devices',
      color: 'from-green-900 to-black',
      link: 'https://play.google.com/store/apps/details?id=com.vividnova.animationengine',
      badge: '★★★★★ 4.9',
    },
    {
      id: 'web',
      name: 'Web App',
      icon: <Download className="w-12 h-12" />,
      description: 'Use directly in your browser',
      color: 'from-purple-900 to-black',
      link: 'http://0.0.0.0:8080',
      badge: 'Open Now',
    },
  ]

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-950/40 to-black/80 border-b border-purple-500/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎨 Vivid Nova Garden Jade
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Transform your images into stunning 3D animated experiences
          </p>
          <p className="text-gray-400">
            Available on iOS, Android, and Web - Completely Free
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          📥 Download Now - Free Forever
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id as any)}
              className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105`}
            >
              <div
                className={`bg-gradient-to-br ${platform.color} rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all`}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6 text-purple-400 group-hover:text-purple-300 transition-colors">
                  {platform.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {platform.name}
                </h3>
                <p className="text-gray-400 mb-4">
                  {platform.description}
                </p>

                {/* Badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-yellow-400 text-sm font-semibold">
                    {platform.badge}
                  </span>
                </div>

                {/* Download Button */}
                <a
                  href={platform.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Free
                </a>
              </div>
            </button>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-purple-900/30 to-black/50 rounded-xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">✨ Features</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✓</span>
                Real-time 3D Animation Engine
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✓</span>
                Advanced Shader Effects
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✓</span>
                360° Rotation Controls
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✓</span>
                Wave Distortion Effects
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✓</span>
                Color Shift Animations
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✓</span>
                Glow & Luminosity Effects
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-black/50 rounded-xl p-8 border border-green-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">🚀 Why Choose Us?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                100% Free - No Hidden Costs
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                Cross-Platform (iOS, Android, Web)
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                No Ads or Subscriptions
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                Offline Mode Available
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                Open Source Technology
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                Regular Updates & New Features
              </li>
            </ul>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gradient-to-br from-blue-900/30 to-black/50 rounded-xl p-8 border border-blue-500/20 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6">📋 System Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-3">iOS</h4>
              <p className="text-gray-400">iOS 14.0 or later</p>
              <p className="text-gray-400">iPhone, iPad, iPod Touch</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-300 mb-3">Android</h4>
              <p className="text-gray-400">Android 8.0 or later</p>
              <p className="text-gray-400">2GB RAM minimum</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-300 mb-3">Web</h4>
              <p className="text-gray-400">Modern browser (Chrome, Safari, Firefox)</p>
              <p className="text-gray-400">Desktop or Mobile</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Images?
            </h2>
            <p className="text-lg text-gray-100 mb-8">
              Download Vivid Nova Garden Jade for free and start creating stunning 3D animations today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://apps.apple.com/vivid-nova-garden-jade"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <Apple className="w-6 h-6" />
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.vividnova.animationengine"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <Smartphone className="w-6 h-6" />
                Google Play
              </a>
              <a
                href="http://0.0.0.0:8080"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <Download className="w-6 h-6" />
                Open Web App
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-purple-500/20 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">
            Vivid Nova Garden Jade - Transform Images into 3D Animations
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Vivid Nova. All rights reserved. | Free & Open Source
          </p>
        </div>
      </div>
    </div>
  )
}
