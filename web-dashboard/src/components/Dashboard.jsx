import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats, getInterviewReports, getUserActivities, getProgressData, getUserProblems, getUserAnalytics, getTopicProficiency } from '../services/firebase'
import { TrendingUp, Trophy, Target, Clock, Award, Brain, Activity, Zap, CheckCircle, Code } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [activities, setActivities] = useState([])
  const [progressData, setProgressData] = useState(null)
  const [problems, setProblems] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [topicData, setTopicData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    console.log('📊 Loading dashboard data for user:', user.uid)
    setLoading(true)

    // Load all data including problems for accurate count
    const [statsResult, interviewsResult, activitiesResult, progressResult, problemsResult, analyticsResult, topicResult] = await Promise.all([
      getUserStats(user.uid),
      getInterviewReports(user.uid, 20), // Fetch last 20 interviews for better graph
      getUserActivities(user.uid, 20),
      getProgressData(user.uid),
      getUserProblems(user.uid, 1000),
      getUserAnalytics(user.uid),
      getTopicProficiency(user.uid)
    ])

    console.log('📈 Stats loaded:', statsResult.data)
    console.log('🎤 Interviews loaded:', interviewsResult.data?.length || 0, 'interviews')
    console.log('🎤 Interview data:', interviewsResult.data)
    console.log('📝 Activities loaded:', activitiesResult.data?.length || 0, 'activities')
    console.log('📊 Progress loaded:', progressResult.data)
    console.log('✅ Problems loaded:', problemsResult.data?.length || 0, 'problems')
    console.log('🎯 Analytics loaded:', analyticsResult.data)

    if (statsResult.data) setStats(statsResult.data)
    if (interviewsResult.data) {
      console.log('✅ Setting recentInterviews state with', interviewsResult.data.length, 'interviews')
      setRecentInterviews(interviewsResult.data)
    }
    if (activitiesResult.data) setActivities(activitiesResult.data)
    if (progressResult.data) setProgressData(progressResult.data)
    if (problemsResult.data) setProblems(problemsResult.data)
    if (topicResult.data) setTopicData(topicResult.data)
    if (analyticsResult.data) setAnalytics(analyticsResult.data)

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  // Calculate problems by difficulty from actual problems data
  const problemsByDifficulty = {
    easy: problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
    medium: problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
    hard: problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length
  }
  const pieData = [
    { name: 'Easy', value: problemsByDifficulty.easy, color: '#10b981' },
    { name: 'Medium', value: problemsByDifficulty.medium, color: '#f59e0b' },
    { name: 'Hard', value: problemsByDifficulty.hard, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user.displayName?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-400 mt-1">Here's your interview preparation progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Trophy className="text-yellow-500" />}
          label="Problems Solved"
          value={problems.length}
          trend={`+${Math.min(problems.filter(p => {
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return p.solvedAt >= weekAgo;
          }).length, 99)} this week`}
          trendUp={true}
        />
        <StatCard
          icon={<Target className="text-primary-500" />}
          label="Interview Score"
          value={recentInterviews.length > 0 
            ? `${recentInterviews[0]?.scores?.overall || recentInterviews[0]?.overallScore || 0}/100`
            : '0/100'
          }
          trend={recentInterviews.length > 0 ? 'Latest interview' : 'No interviews yet'}
          trendUp={true}
        />
        <StatCard
          icon={<Clock className="text-blue-500" />}
          label="Total Interviews"
          value={recentInterviews.length}
          trend={recentInterviews.length > 0 
            ? `${recentInterviews.filter(i => {
                const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                return i.timestamp >= monthAgo;
              }).length} this month`
            : 'Start practicing'
          }
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Interview Performance Trend */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          {/* Header with Stats */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Interview Performance</h3>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Latest Score: </span>
                  <span className="text-white font-bold text-lg">
                    {recentInterviews[0]?.scores?.overall || recentInterviews[0]?.overallScore || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Total Interviews: </span>
                  <span className="text-white font-semibold">{recentInterviews.length}</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#667eea]"></div>
                <span className="text-gray-300">Overall</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                <span className="text-gray-300">Communication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-gray-300">Technical</span>
              </div>
            </div>
          </div>

          {/* Graph */}
          {recentInterviews.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Complete interviews to see your performance tracking</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart 
                data={recentInterviews.slice().reverse().map((interview, idx) => ({
                  name: `#${idx + 1}`,
                  overall: interview.scores?.overall || interview.overallScore || 0,
                  communication: interview.scores?.communication || interview.report?.communication || 0,
                  technical: interview.scores?.technical || interview.report?.technicalSkill || 0,
                  date: new Date(interview.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value, name) => {
                    const labels = {
                      overall: 'Overall',
                      communication: 'Communication',
                      technical: 'Technical'
                    };
                    return [`${value}/100`, labels[name] || name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `Interview ${label} - ${payload[0].payload.date}`;
                    }
                    return label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 4, strokeWidth: 2, stroke: '#1f2937' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#667eea' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="communication" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 2, stroke: '#1f2937' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="technical" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 3, strokeWidth: 2, stroke: '#1f2937' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Topics Section - AI-Based Classification */}
      {topicData && (topicData.strengths?.length > 0 || topicData.weaknesses?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strong Topics */}
          <div className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-xl shadow-lg p-6 border border-green-700/30">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-green-500" size={20} />
              <h3 className="text-lg font-semibold text-white">Strong Topics</h3>
              <span className="ml-auto text-xs text-gray-500 italic">AI-analyzed</span>
            </div>
            {topicData.strengths && topicData.strengths.length > 0 ? (
              <div className="space-y-2">
                {topicData.strengths.map((topic, idx) => {
                  const performance = topicData.topicPerformance?.[topic]
                  const proficiency = performance 
                    ? Math.round((performance.strong / performance.total) * 100) 
                    : 100
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-200">{topic}</span>
                        {performance && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {performance.total} solved • {proficiency}% success
                          </div>
                        )}
                      </div>
                      <span className="text-green-400 text-sm font-semibold">✓ Proficient</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Complete interviews or solve problems to identify your strengths
              </p>
            )}
          </div>

          {/* Focus Areas */}
          <div className="bg-gradient-to-br from-orange-900/20 to-gray-800 rounded-xl shadow-lg p-6 border border-orange-700/30">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-orange-500" size={20} />
              <h3 className="text-lg font-semibold text-white">Focus Areas</h3>
              <span className="ml-auto text-xs text-gray-500 italic">AI-analyzed</span>
            </div>
            {topicData.weaknesses && topicData.weaknesses.length > 0 ? (
              <div className="space-y-2">
                {topicData.weaknesses.map((topic, idx) => {
                  const performance = topicData.topicPerformance?.[topic]
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-200">{topic}</span>
                        {performance && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {performance.total} attempted • Needs improvement
                          </div>
                        )}
                      </div>
                      <span className="text-orange-400 text-sm font-semibold">Practice more</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Complete interviews or solve problems to identify areas for improvement
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity and Progress */}
      <div className="grid grid-cols-1 gap-6">
        {/* Activity Feed */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="text-blue-500 mr-2" size={20} />
            Recent Activity
            <span className="ml-2 text-xs text-gray-500">(Auto-syncs from extension)</span>
          </h3>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No activity yet. Solve problems using the extension to see activity here!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'problem_solved':
        return <CheckCircle className="text-green-500" size={18} />
      case 'interview_completed':
        return <Trophy className="text-yellow-500" size={18} />
      case 'hint_request':
        return <Brain className="text-blue-500" size={18} />
      default:
        return <Activity className="text-gray-500" size={18} />
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'problem_solved':
        return (
          <>
            Solved <span className="font-semibold">{activity.problemId}</span>
            {activity.difficulty && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                activity.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                activity.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {activity.difficulty}
              </span>
            )}
          </>
        )
      case 'interview_completed':
        return (
          <>
            Completed interview - Score: <span className="font-semibold">{activity.score}/100</span>
          </>
        )
      default:
        return activity.type.replace(/_/g, ' ')
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">
          {getActivityText(activity)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {activity.platform && `${activity.platform} • `}
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function ProgressMetric({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  )
}

function StatCard({ icon, label, value, trend, trendUp }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div>{icon}</div>
        {trend && (
          <span className={`text-xs font-medium ${
            trendUp ? 'text-green-400' : 'text-red-400'
          }`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  )
}

function getReadinessLabel(score) {
  if (score >= 80) return 'Interview Ready'
  if (score >= 60) return 'Advanced'
  if (score >= 40) return 'Intermediate'
  return 'Beginner'
}
