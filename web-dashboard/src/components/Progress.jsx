import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserProblems, getUserStats } from '../services/firebase'
import { Calendar, TrendingUp, Award, CheckCircle } from 'lucide-react'

export default function Progress() {
  const { user } = useAuth()
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState(null)
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

    setLoading(false)
  }

  const filteredProblems = filter === 'all' 
    ? problems 
    : problems.filter(p => p.difficulty?.toLowerCase() === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading progress...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-600 mt-1">Track all problems you've solved</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({problems.length})
          </button>
          <button
            onClick={() => setFilter('easy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'easy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Easy ({problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length})
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'medium'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Medium ({problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length})
          </button>
          <button
            onClick={() => setFilter('hard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'hard'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hard ({problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length})
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Solved Problems</h3>
          
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No problems solved yet. Start solving to see your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.problemId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <h4 className="font-semibold text-gray-900">{problem.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            problem.difficulty?.toLowerCase() === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : problem.difficulty?.toLowerCase() === 'hard'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {problem.difficulty || 'Medium'}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(problem.solvedAt).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{problem.platform}</span>
                        {problem.timeSpent > 0 && (
                          <span>{problem.timeSpent} min</span>
                        )}
                        {problem.hintsUsed > 0 && (
                          <span className="text-orange-600">
                            {problem.hintsUsed} hint{problem.hintsUsed > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      {problem.topics && problem.topics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {problem.topics.slice(0, 5).map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
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

