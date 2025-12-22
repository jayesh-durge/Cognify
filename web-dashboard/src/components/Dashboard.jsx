import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats, getInterviewReports } from '../services/firebase'
import { TrendingUp, Trophy, Target, Clock, Award, Brain } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)

    // Load user stats
    const { data: statsData } = await getUserStats(user.uid)
    if (statsData) {
      setStats(statsData)
    }

    // Load recent interviews
    const { data: interviews } = await getInterviewReports(user.uid, 5)
    setRecentInterviews(interviews)

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  const problemsByDifficulty = stats?.problemsByDifficulty || { easy: 0, medium: 0, hard: 0 }
  const pieData = [
    { name: 'Easy', value: problemsByDifficulty.easy, color: '#10b981' },
    { name: 'Medium', value: problemsByDifficulty.medium, color: '#f59e0b' },
    { name: 'Hard', value: problemsByDifficulty.hard, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.displayName?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-600 mt-1">Here's your interview preparation progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Trophy className="text-yellow-500" />}
          label="Problems Solved"
          value={stats?.solvedCount || 0}
          trend="+12 this week"
          trendUp={true}
        />
        <StatCard
          icon={<Target className="text-primary-500" />}
          label="Interview Score"
          value={`${Math.round(stats?.avgInterviewScore || 0)}/100`}
          trend="Above average"
          trendUp={true}
        />
        <StatCard
          icon={<Clock className="text-blue-500" />}
          label="Total Interviews"
          value={stats?.totalInterviews || 0}
          trend="+2 this month"
          trendUp={true}
        />
        <StatCard
          icon={<Brain className="text-purple-500" />}
          label="Readiness Level"
          value={getReadinessLabel(stats?.avgInterviewScore || 0)}
          trend="Keep improving!"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problems by Difficulty */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Problems by Difficulty</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Interview Performance Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={recentInterviews.map((interview, idx) => ({
              name: `Interview ${recentInterviews.length - idx}`,
              score: interview.report?.overallScore || 0,
              communication: interview.report?.communication || 0,
              technical: interview.report?.technicalSkill || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} />
              <Line type="monotone" dataKey="communication" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="technical" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="text-green-500 mr-2" size={20} />
            Strong Topics
          </h3>
          <div className="space-y-2">
            {(stats?.strongTopics || ['Arrays', 'Strings']).map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">{topic}</span>
                <span className="text-green-600 text-sm font-semibold">✓ Proficient</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="text-orange-500 mr-2" size={20} />
            Focus Areas
          </h3>
          <div className="space-y-2">
            {(stats?.weakTopics || ['Dynamic Programming', 'Graphs']).map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">{topic}</span>
                <span className="text-orange-600 text-sm font-semibold">Practice more</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interviews</h3>
        {recentInterviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No interview sessions yet. Start practicing to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInterviews.map((interview, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{interview.problemId}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(interview.timestamp).toLocaleDateString()} • {interview.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-500">
                      {interview.report?.overallScore || 0}
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>{icon}</div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  )
}

function getReadinessLabel(score) {
  if (score >= 80) return 'Interview Ready'
  if (score >= 60) return 'Advanced'
  if (score >= 40) return 'Intermediate'
  return 'Beginner'
}
