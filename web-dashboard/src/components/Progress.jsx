import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserProblems, getUserStats, getTopicProficiency } from '../services/firebase'
import { Calendar, TrendingUp, Award, CheckCircle, Trophy, Target } from 'lucide-react'

export default function Progress() {
  const { user } = useAuth()
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState(null)
  const [topicData, setTopicData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, easy, medium, hard

  useEffect(() => {
    loadProgressData()
  }, [user])

  const loadProgressData = async () => {
    if (!user) return

    setLoading(true)

    // Load problems
    const { data: problemsData } = await getUserProblems(user.uid, 100)
    setProblems(problemsData || [])

    // Load stats
    const { data: statsData } = await getUserStats(user.uid)
    setStats(statsData)
    
    // Load topic proficiency
    const { data: topicProficiencyData } = await getTopicProficiency(user.uid)
    setTopicData(topicProficiencyData)

    setLoading(false)
  }

  const filteredProblems = filter === 'all' 
    ? problems 
    : problems.filter(p => p.difficulty?.toLowerCase() === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading progress...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Your Progress</h1>
        <p className="text-gray-400 mt-1">Track all problems you've solved</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({problems.length})
          </button>
          <button
            onClick={() => setFilter('easy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'easy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Easy ({problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length})
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'medium'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Medium ({problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length})
          </button>
          <button
            onClick={() => setFilter('hard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'hard'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Hard ({problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length})
          </button>
        </div>
      </div>

      {/* Strong Topics & Focus Areas */}
      {topicData && (topicData.strengths?.length > 0 || topicData.weaknesses?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strong Topics */}
          <div className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-xl shadow-lg p-6 border border-green-700/30">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-green-500" size={24} />
              <h3 className="text-lg font-semibold text-white">Strong Topics</h3>
            </div>
            {topicData.strengths && topicData.strengths.length > 0 ? (
              <div className="space-y-3">
                {topicData.strengths.map((topic, idx) => {
                  const performance = topicData.topicPerformance?.[topic]
                  const proficiency = performance 
                    ? Math.round((performance.strong / performance.total) * 100) 
                    : 100
                  
                  return (
                    <div key={idx} className="bg-green-500/10 border border-green-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-medium">{topic}</span>
                        <span className="text-green-500 text-sm">✓ Proficient</span>
                      </div>
                      {performance && (
                        <div className="text-xs text-gray-400">
                          {performance.total} problem{performance.total !== 1 ? 's' : ''} solved • {proficiency}% success rate
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Complete more problems to identify your strengths
              </p>
            )}
          </div>

          {/* Focus Areas */}
          <div className="bg-gradient-to-br from-orange-900/20 to-gray-800 rounded-xl shadow-lg p-6 border border-orange-700/30">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-orange-500" size={24} />
              <h3 className="text-lg font-semibold text-white">Focus Areas</h3>
            </div>
            {topicData.weaknesses && topicData.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {topicData.weaknesses.map((topic, idx) => {
                  const performance = topicData.topicPerformance?.[topic]
                  
                  return (
                    <div key={idx} className="bg-orange-500/10 border border-orange-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-400 font-medium">{topic}</span>
                        <span className="text-orange-500 text-sm">Practice more</span>
                      </div>
                      {performance && (
                        <div className="text-xs text-gray-400">
                          {performance.total} problem{performance.total !== 1 ? 's' : ''} attempted • Needs improvement
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Complete more problems to identify areas for improvement
              </p>
            )}
          </div>
        </div>
      )}

      {/* Problems List */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Solved Problems</h3>
          
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No problems solved yet. Start solving to see your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.problemId}
                  className="p-4 border border-gray-700 rounded-lg hover:border-primary-500 transition-colors bg-gray-700/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <h4 className="font-semibold text-white">{problem.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            problem.difficulty?.toLowerCase() === 'easy'
                              ? 'bg-green-500/20 text-green-400'
                              : problem.difficulty?.toLowerCase() === 'hard'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}
                        >
                          {problem.difficulty || 'Medium'}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(problem.solvedAt).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{problem.platform}</span>
                        {problem.timeSpent > 0 && (
                          <span>{problem.timeSpent} min</span>
                        )}
                        {problem.hintsUsed > 0 && (
                          <span className="text-orange-400">
                            {problem.hintsUsed} hint{problem.hintsUsed > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      {problem.topics && problem.topics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {problem.topics.slice(0, 5).map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

