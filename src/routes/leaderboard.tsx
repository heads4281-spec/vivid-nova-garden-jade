import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Trophy, Medal, Zap, Target } from 'lucide-react'

export const Route = createFileRoute('/leaderboard')' ({
  component: LeaderboardPage,
})

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  animations: number
  level: string
  badge: string
}

function LeaderboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<'global' | 'weekly' | 'friends'>('global')

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, username: 'PixelMaster420', score: 125400, animations: 342, level: 'Diamond', badge: '👑' },
    { rank: 2, username: 'AnimationGod', score: 118900, animations: 298, level: 'Platinum', badge: '⭐' },
    { rank: 3, username: 'ShadowRender', score: 109300, animations: 276, level: 'Gold', badge: '🏆' },
    { rank: 4, username: 'VividCreator', score: 98700, animations: 245, level: 'Silver', badge: '🎨' },
    { rank: 5, username: 'NovaWizard', score: 87600, animations: 201, level: 'Silver', badge: '✨' },
    { rank: 6, username: 'ShaderMaster', score: 76400, animations: 189, level: 'Gold', badge: '⚡' },
    { rank: 7, username: 'CosmoArtist', score: 65300, animations: 156, level: 'Bronze', badge: '🌟' },
    { rank: 8, username: 'PrismaLight', score: 54200, animations: 134, level: 'Bronze', badge: '💎' },
    { rank: 9, username: 'EchoDesign', score: 43100, animations: 112, level: 'Silver', badge: '🎭' },
    { rank: 10, username: 'VortexFX', score: 32000, animations: 87, level: 'Bronze', badge: '🌀' },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Diamond':
        return 'text-cyan-400'
      case 'Platinum':
        return 'text-gray-300'
      case 'Gold':
        return 'text-yellow-400'
      case 'Silver':
        return 'text-gray-400'
      case 'Bronze':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-yellow-950/40 to-black/80 border-b border-yellow-500/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">
              🏆 Global Leaderboard
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Compete with millions of players worldwide. Create stunning animations and climb the ranks!
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          {[
            { id: 'global', label: '🌍 Global', icon: Trophy },
            { id: 'weekly', label: '📅 Weekly', icon: Medal },
            { id: 'friends', label: '👥 Friends', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-900/30 to-black/50 rounded-lg p-6 border border-purple-500/20">
            <div className="text-gray-400 text-sm mb-2">Total Players</div>
            <div className="text-3xl font-bold text-purple-400">2.5M+</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-black/50 rounded-lg p-6 border border-blue-500/20">
            <div className="text-gray-400 text-sm mb-2">Animations Created</div>
            <div className="text-3xl font-bold text-blue-400">45.8M+</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-black/50 rounded-lg p-6 border border-green-500/20">
            <div className="text-gray-400 text-sm mb-2">Daily Active</div>
            <div className="text-3xl font-bold text-green-400">1.2M+</div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/30 to-black/50 rounded-lg p-6 border border-pink-500/20">
            <div className="text-gray-400 text-sm mb-2">Your Rank</div>
            <div className="text-3xl font-bold text-pink-400">#12,847</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gradient-to-br from-gray-900/30 to-black/50 rounded-xl border border-yellow-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-500/20 bg-yellow-950/20">
                  <th className="px-6 py-4 text-left text-yellow-400 font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-yellow-400 font-semibold">Player</th>
                  <th className="px-6 py-4 text-left text-yellow-400 font-semibold">Score</th>
                  <th className="px-6 py-4 text-left text-yellow-400 font-semibold">Animations</th>
                  <th className="px-6 py-4 text-left text-yellow-400 font-semibold">Level</th>
                  <th className="px-6 py-4 text-left text-yellow-400 font-semibold">Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${
                      entry.rank <= 3 ? 'bg-yellow-950/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-2xl">
                        {getRankIcon(entry.rank)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {entry.username.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{entry.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-yellow-400">
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{entry.animations}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getLevelColor(entry.level)}`}>
                        {entry.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl">{entry.badge}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">🎖️ Top Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-900/30 to-black/50 rounded-lg p-6 border border-yellow-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🥇</div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-400">First Place</h3>
                  <p className="text-gray-400 text-sm">Claimed by PixelMaster420</p>
                </div>
              </div>
              <p className="text-gray-300">Create 300+ animations and reach the top of the global leaderboard</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 rounded-lg p-6 border border-purple-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🔥</div>
                <div>
                  <h3 className="text-xl font-bold text-purple-400">Streak Master</h3>
                  <p className="text-gray-400 text-sm">30-day login streak</p>
                </div>
              </div>
              <p className="text-gray-300">Login every day for a month to unlock exclusive rewards</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-black/50 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">⚡</div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400">Speed Runner</h3>
                  <p className="text-gray-400 text-sm">Create 10 animations in one hour</p>
                </div>
              </div>
              <p className="text-gray-300">Rapid-fire creation challenge for ultimate speed demons</p>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mt-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">💎 Exclusive Rewards</h2>
          <p className="text-lg text-gray-100 mb-8">
            Top players earn exclusive skins, effects, and premium features!
          </p>
          <button className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all inline-flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            View Reward Tiers
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-yellow-500/20 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">
            Compete, Create, and Conquer the Leaderboard!
          </p>
          <p className="text-sm text-gray-500">
            Rankings update hourly. Compete fairly and respect the community.
          </p>
        </div>
      </div>
    </div>
  )
}
