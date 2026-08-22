import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { AnimationEngine } from '../components/AnimationEngine'

export const Route = createFileRoute('/')' ({
  component: AnimationPage,
})

function AnimationPage() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [autoRotate, setAutoRotate] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlInput = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      setImageUrl(url)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-black">
      {/* Header Controls */}
      <div className="bg-gradient-to-b from-black/80 to-transparent p-6 border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎨 Vivid Nova Garden Jade
          </h1>
          <p className="text-gray-400 mb-4">
            Convert your images into real-time 3D animated experiences
          </p>

          {/* Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Upload Image</label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  📁 Choose Image
                </button>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Or Paste Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                onChange={(e) => handleUrlInput(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Auto Rotate Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoRotate"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="autoRotate" className="text-sm font-medium text-gray-300 cursor-pointer">
                ✨ Auto-Rotation
              </label>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-400">
              {imageUrl ? '✅ Image loaded' : '⏳ Waiting for image'}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Animation Canvas */}
      <div className="flex-1 overflow-hidden">
        <AnimationEngine
          imageUrl={imageUrl}
          autoRotate={autoRotate}
          showControls={true}
        />
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-purple-500/20 px-6 py-3">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>🚀 Full-Stack 3D Animation Engine | Three.js + React + Shader Animations</p>
        </div>
      </div>
    </div>
  )
}