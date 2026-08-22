import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AnimationEngine } from '../components/AnimationEngine'

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
})

interface GalleryItem {
  id: string
  title: string
  imageUrl: string
  description: string
}

const SAMPLE_IMAGES: GalleryItem[] = [
  {
    id: '1',
    title: 'Cosmic Nebula',
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400',
    description: 'A beautiful cosmic nebula in deep space',
  },
  {
    id: '2',
    title: 'Aurora Borealis',
    imageUrl: 'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=400',
    description: 'Northern lights dancing across the sky',
  },
  {
    id: '3',
    title: 'Ocean Waves',
    imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    description: 'Serene ocean waves at sunset',
  },
  {
    id: '4',
    title: 'Mountain Peak',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    description: 'Snow-capped mountain majesty',
  },
]

function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(SAMPLE_IMAGES[0])

  return (
    <div className="w-full h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-black/80 to-transparent p-6 border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎭 Gallery - 3D Animation Showcase
          </h1>
          <p className="text-gray-400">
            Explore stunning real-time 3D animations created from your images
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 max-w-6xl mx-auto w-full overflow-hidden">
        {/* 3D Viewer */}
        <div className="flex-1 rounded-lg overflow-hidden border border-purple-500/20 bg-black/50">
          {selectedItem && (
            <AnimationEngine
              imageUrl={selectedItem.imageUrl}
              autoRotate={true}
              showControls={true}
            />
          )}
        </div>

        {/* Gallery List & Info */}
        <div className="w-80 flex flex-col gap-4">
          {/* Item Info */}
          {selectedItem && (
            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 rounded-lg p-4 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-2">
                {selectedItem.title}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {selectedItem.description}
              </p>
              <div className="text-xs text-gray-500">
                ID: {selectedItem.id}
              </div>
            </div>
          )}

          {/* Gallery Items */}
          <div className="space-y-2 overflow-y-auto flex-1">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              🎨 Available Models
            </h3>
            {SAMPLE_IMAGES.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedItem.id === item.id
                    ? 'bg-purple-600/50 border border-purple-500'
                    : 'bg-gray-900/30 border border-gray-700/50 hover:border-purple-500/50'
                }`}
              >
                <div className="font-medium text-white text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {item.description}
                </div>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20 text-sm text-gray-300">
            <div className="font-semibold text-white mb-2">✨ Features:</div>
            <ul className="space-y-1 text-xs">
              <li>✓ Real-time 3D rendering</li>
              <li>✓ Shader wave effects</li>
              <li>✓ 360° rotation controls</li>
              <li>✓ Color shift animations</li>
              <li>✓ Glow effects</li>
              <li>✓ Touch & mouse support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
