import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WeaponMechanicsEngine } from '../components/WeaponMechanicsEngine'
import { Zap, Shield, Wand2, Swords } from 'lucide-react'

export const Route = createFileRoute('/weapons')' ({
  component: WeaponsPage,
})

interface WeaponMechanics {
  id: string
  name: string
  type: 'melee' | 'ranged' | 'magical' | 'hybrid'
  damage: number
  attackSpeed: number
  critChance: number
  range: number
  weight: number
  durability: number
  description: string
  effects: string[]
  lore: string
}

const WEAPONS: WeaponMechanics[] = [
  {
    id: 'crimson_sword',
    name: 'Crimson Blade',
    type: 'melee',
    damage: 75,
    attackSpeed: 1.5,
    critChance: 15,
    range: 2,
    weight: 5,
    durability: 100,
    description: 'A legendary sword imbued with crimson magic. Causes bleeding on enemies.',
    effects: ['Bleed', 'Lifesteal 10%', 'Attack Speed +15%'],
    lore: 'Forged in the depths of the Crimson Sovereign realm, this blade hungers for blood.',
  },
  {
    id: 'void_bow',
    name: 'Void Archer',
    type: 'ranged',
    damage: 60,
    attackSpeed: 2.0,
    critChance: 25,
    range: 8,
    weight: 3,
    durability: 80,
    description: 'A mystical bow that fires void-infused arrows. Each arrow pierces through enemies.',
    effects: ['Pierce', 'Chain Hit', 'Void Damage'],
    lore: 'Crafted from the void itself, arrows never miss their mark.',
  },
  {
    id: 'staff_of_sovereignty',
    name: 'Staff of Sovereignty',
    type: 'magical',
    damage: 85,
    attackSpeed: 0.8,
    critChance: 20,
    range: 6,
    weight: 4,
    durability: 120,
    description: 'An ancient staff channeling sovereign power. Deals massive magical damage.',
    effects: ['Area Damage', 'Mana Recovery', 'Element Mastery'],
    lore: 'This staff has guided empires to victory throughout the ages.',
  },
  {
    id: 'blood_axe',
    name: 'Bloodlust Axe',
    type: 'melee',
    damage: 95,
    attackSpeed: 0.9,
    critChance: 20,
    range: 2.5,
    weight: 7,
    durability: 110,
    description: 'A massive axe that grows stronger with each kill. Crushing blows.',
    effects: ['Execute', 'Stacking Damage', 'Armor Pierce 30%'],
    lore: 'Thirsts for battle. Each swing echoes with blood-soaked history.',
  },
  {
    id: 'void_dagger',
    name: 'Void Ripper',
    type: 'melee',
    damage: 50,
    attackSpeed: 2.5,
    critChance: 35,
    range: 1.5,
    weight: 1.5,
    durability: 90,
    description: 'A swift dagger phased with void energy. Perfect for assassins.',
    effects: ['Poison', 'Backstab 2x', 'Evasion +20%'],
    lore: 'Moves between shadows. Strikes from the darkness.',
  },
  {
    id: 'crimson_hammer',
    name: 'Sovereign Hammer',
    type: 'hybrid',
    damage: 100,
    attackSpeed: 0.7,
    critChance: 10,
    range: 2,
    weight: 8,
    durability: 150,
    description: 'An enormous hammer that commands respect. Stuns enemies with shockwaves.',
    effects: ['Stun', 'Shockwave', 'Unbreakable'],
    lore: 'Symbol of absolute authority. None can withstand its might.',
  },
]

function WeaponsPage() {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponMechanics>(WEAPONS[0])
  const [activeWeapon, setActiveWeapon] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'melee' | 'ranged' | 'magical' | 'hybrid'>('all')

  const filteredWeapons = WEAPONS.filter((w) => {
    if (filterType === 'all') return true
    return w.type === filterType
  })

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-red-950/40 to-black/80 border-b border-red-500/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚔️ Weapons & Mechanics System
          </h1>
          <p className="text-xl text-gray-300">
            Advanced physics-based weapon mechanics with real-time animation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filter */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'all', label: '🎯 All Weapons', icon: Swords },
            { id: 'melee', label: '🔴 Melee', icon: Swords },
            { id: 'ranged', label: '🎯 Ranged', icon: Zap },
            { id: 'magical', label: '🔮 Magical', icon: Wand2 },
            { id: 'hybrid', label: '⚡ Hybrid', icon: Shield },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                filterType === btn.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Weapons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredWeapons.map((weapon) => (
            <button
              key={weapon.id}
              onClick={() => {
                setSelectedWeapon(weapon)
                setActiveWeapon(weapon.id)
              }}
              className={`text-left p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedWeapon.id === weapon.id
                  ? 'border-red-500 bg-red-950/20'
                  : 'border-gray-700 bg-gray-900/30 hover:border-red-500/50'
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-2">{weapon.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{weapon.description}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-red-400 font-semibold">{weapon.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Damage:</span>
                  <span className="text-yellow-400 font-semibold">{weapon.damage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attack Speed:</span>
                  <span className="text-green-400 font-semibold">{weapon.attackSpeed}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Crit Chance:</span>
                  <span className="text-purple-400 font-semibold">{weapon.critChance}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Weapon Details */}
        {selectedWeapon && (
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-red-500/20 overflow-hidden">
            {/* 3D Preview */}
            <div className="h-80 bg-gradient-to-b from-gray-800 to-gray-900">
              <WeaponMechanicsEngine
                weapon={selectedWeapon}
                isActive={activeWeapon === selectedWeapon.id}
              />
            </div>

            {/* Details Panel */}
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">{selectedWeapon.name}</h2>
                <p className="text-lg text-gray-300 mb-4">{selectedWeapon.description}</p>
                <p className="text-gray-400 italic">"{selectedWeapon.lore}"</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Damage', value: selectedWeapon.damage, color: 'text-red-400' },
                  { label: 'Attack Speed', value: selectedWeapon.attackSpeed, color: 'text-green-400' },
                  { label: 'Crit Chance', value: `${selectedWeapon.critChance}%`, color: 'text-purple-400' },
                  { label: 'Range', value: selectedWeapon.range, color: 'text-blue-400' },
                  { label: 'Weight', value: selectedWeapon.weight, color: 'text-orange-400' },
                  { label: 'Durability', value: selectedWeapon.durability, color: 'text-yellow-400' },
                  { label: 'Type', value: selectedWeapon.type.toUpperCase(), color: 'text-cyan-400' },
                  { label: 'DPS', value: (selectedWeapon.damage * selectedWeapon.attackSpeed).toFixed(1), color: 'text-pink-400' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-black/50 rounded-lg p-4 text-center border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Effects */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">✨ Special Effects</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedWeapon.effects.map((effect, idx) => (
                    <div key={idx} className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-300 font-semibold">{effect}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mechanics */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">⚙️ Mechanical Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-2">📊 DPS Calculation</h4>
                    <p className="text-gray-300 text-sm">
                      {selectedWeapon.damage} × {selectedWeapon.attackSpeed} = {(selectedWeapon.damage * selectedWeapon.attackSpeed).toFixed(1)} DPS
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-2">🎯 Crit Potential</h4>
                    <p className="text-gray-300 text-sm">
                      {selectedWeapon.critChance}% to deal 2x damage = {(selectedWeapon.damage * 2 * (selectedWeapon.critChance / 100)).toFixed(1)} avg crit
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-2">🛡️ Durability</h4>
                    <p className="text-gray-300 text-sm">
                      Lasts for {(selectedWeapon.durability / selectedWeapon.damage).toFixed(0)} powerful strikes
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-2">📏 Range Coverage</h4>
                    <p className="text-gray-300 text-sm">
                      Effective combat range: {selectedWeapon.range} units
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technology Stack */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">🔧 Infrastructure & Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Physics Engine',
              features: [
                '✓ Projectile ballistics with gravity',
                '✓ Collision detection',
                '✓ Impact damage calculation',
                '✓ Trajectory prediction',
              ],
            },
            {
              title: 'Animation System',
              features: [
                '✓ Attack swing animations',
                '✓ Idle weapon rotation',
                '✓ Recoil and impact effects',
                '✓ Particle emission on hit',
              ],
            },
            {
              title: 'Shader Graphics',
              features: [
                '✓ Energy flow animations',
                '✓ Damage glow intensity',
                '✓ Metallic surface effects',
                '✓ Fresnel rim lighting',
              ],
            },
            {
              title: 'Stat System',
              features: [
                '✓ Damage scaling',
                '✓ Attack speed multipliers',
                '✓ Crit chance calculations',
                '✓ DPS metrics',
              ],
            },
          ].map((system, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg p-6 border border-red-500/20">
              <h3 className="text-xl font-bold text-white mb-4">{system.title}</h3>
              <ul className="space-y-2">
                {system.features.map((feature, fidx) => (
                  <li key={fidx} className="text-gray-300 text-sm">{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-red-500/20 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">
            Advanced Weapons & Mechanics System - Full Stack Implementation
          </p>
          <p className="text-sm text-gray-500">
            Three.js Physics | GLSL Shaders | React | TypeScript | Real-time Calculations
          </p>
        </div>
      </div>
    </div>
  )
}
