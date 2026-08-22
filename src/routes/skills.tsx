import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CrimsonSkillIcon } from '../components/CrimsonSkillIcon'

export const Route = createFileRoute('/skills')' ({
  component: SkillsPage,
})

interface Skill {
  id: string
  name: string
  type: 'crimson' | 'void'
  description: string
  category: 'strength' | 'magic' | 'attack' | 'wave' | 'curse' | 'minerals' | 'stones'
}

const SKILLS: Skill[] = [
  {
    id: 'crimson_strength',
    name: 'Crimson Strength',
    type: 'crimson',
    description: 'Powerful red energy enhancement. Increases physical damage output.',
    category: 'strength',
  },
  {
    id: 'blood_magic',
    name: 'Blood Magic',
    type: 'crimson',
    description: 'Harness blood energy for devastating magical attacks.',
    category: 'magic',
  },
  {
    id: 'sovereign_attack',
    name: 'Sovereign Attack',
    type: 'void',
    description: 'Purple lightning strike. Deals massive damage with chain effect.',
    category: 'attack',
  },
  {
    id: 'crimson_wave',
    name: 'Crimson Wave',
    type: 'crimson',
    description: 'Release a wave of crimson energy that knocks back enemies.',
    category: 'wave',
  },
  {
    id: 'dominion_mind',
    name: 'Dominion Mind',
    type: 'void',
    description: 'Control enemy minds temporarily. Purple mental power.',
    category: 'magic',
  },
  {
    id: 'crimson_curse',
    name: 'Crimson Curse',
    type: 'crimson',
    description: 'Curse enemies with blood magic debuffs.',
    category: 'curse',
  },
  {
    id: 'soul_drain',
    name: 'Soul Drain',
    type: 'void',
    description: 'Drain enemy souls and heal yourself with void magic.',
    category: 'magic',
  },
  {
    id: 'royal_command',
    name: 'Royal Command',
    type: 'crimson',
    description: 'Command allies with powerful crimson authority.',
    category: 'strength',
  },
  {
    id: 'blood_minerals',
    name: 'Blood Minerals',
    type: 'crimson',
    description: 'Crystallize blood into defensive barriers.',
    category: 'minerals',
  },
  {
    id: 'void_crystals',
    name: 'Void Crystals',
    type: 'void',
    description: 'Summon purple void crystals for area denial.',
    category: 'minerals',
  },
  {
    id: 'sovereign_stones',
    name: 'Sovereign Stones',
    type: 'crimson',
    description: 'Drop crimson stones that damage enemies on impact.',
    category: 'stones',
  },
  {
    id: 'abyss_gems',
    name: 'Abyss Gems',
    type: 'void',
    description: 'Summon void gems for massive dark damage.',
    category: 'stones',
  },
]

function SkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(SKILLS[0])
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'crimson' | 'void'>('all')

  const filteredSkills = SKILLS.filter((skill) => {
    if (filter === 'all') return true
    return skill.type === filter
  })

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-950/40 to-black/80 border-b border-purple-500/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚔️ Crimson Sovereign Skills
          </h1>
          <p className="text-xl text-gray-300">
            Explore powerful abilities powered by advanced 3D animation and shader effects
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filter */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'all', label: '🎯 All Skills' },
            { id: 'crimson', label: '🔴 Crimson' },
            { id: 'void', label: '💜 Void' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === btn.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              onMouseEnter={() => setHoveredSkill(skill.id)}
              onMouseLeave={() => setHoveredSkill(null)}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <CrimsonSkillIcon
                skillName={skill.name}
                type={skill.type}
                intensity={hoveredSkill === skill.id ? 1.5 : 1}
                isActive={selectedSkill?.id === skill.id}
              />
              <p className="text-center text-sm text-gray-300 mt-2 truncate">{skill.name}</p>
            </div>
          ))}
        </div>

        {/* Skill Details */}
        {selectedSkill && (
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-8 border border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="flex flex-col items-center justify-center">
                <CrimsonSkillIcon
                  skillName={selectedSkill.name}
                  type={selectedSkill.type}
                  intensity={1.5}
                  isActive={true}
                />
                <p className="text-center text-gray-400 mt-4 text-sm">
                  Advanced 3D shader animation with particle effects
                </p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedSkill.name}
                  </h2>
                  <p className="text-lg text-gray-300 mb-4">
                    {selectedSkill.description}
                  </p>
                </div>

                <div className="bg-black/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className={`text-lg font-bold ${
                      selectedSkill.type === 'crimson' ? 'text-red-400' : 'text-purple-400'
                    }`}>
                      {selectedSkill.type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {selectedSkill.category.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="bg-black/50 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">✨ Shader Effects</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Multi-layer wave animation</li>
                    <li>✓ Advanced noise patterns</li>
                    <li>✓ Dynamic color mixing</li>
                    <li>✓ Particle emission system</li>
                    <li>✓ Fresnel rim lighting</li>
                    <li>✓ Additive blending effects</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technology Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">🚀 Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Advanced Shaders',
              description: 'GLSL shaders with multi-layer animations, noise functions, and dynamic lighting',
              icon: '🎨',
            },
            {
              title: 'Particle System',
              description: 'Real-time particle emission with velocity, lifetime, and color transitions',
              icon: '✨',
            },
            {
              title: 'Three.js Engine',
              description: 'High-performance 3D rendering with WebGL optimization and smooth 60+ FPS',
              icon: '⚡',
            },
          ].map((tech, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all"
            >
              <div className="text-4xl mb-3">{tech.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{tech.title}</h3>
              <p className="text-gray-400">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-purple-500/20 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">
            Crimson Sovereign - Advanced 3D Skill Visualization System
          </p>
          <p className="text-sm text-gray-500">
            Built with Three.js, React, TypeScript, and Advanced GLSL Shaders
          </p>
        </div>
      </div>
    </div>
  )
}
