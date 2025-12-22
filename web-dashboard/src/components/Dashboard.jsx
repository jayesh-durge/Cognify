import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats, getInterviewReports, getUserActivities, getProgressData } from '../services/firebase'
import { TrendingUp, Trophy, Target, Clock, Award, Brain, Activity, Zap, CheckCircle, Code } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [activities, setActivities] = useState([])
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)

    // Load all data
    const [statsResult, interviewsResult, activitiesResult, progressResult] = await Promise.all([
      getUserStats(user.uid),
      getInterviewReports(user.uid, 5),
      getUserActivities(user.uid, 20),
      getProgressData(user.uid)
    ])

    if (statsResult.data) setStats(statsResult.data)
    if (interviewsResult.data) setRecentInterviews(interviewsResult.data)
    if (activitiesResult.data) setActivities(activitiesResult.data)
    if (progressResult.data) setProgressData(progressResult.data)

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
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

      {/* Recent Activity and Progress */}
      <div className="grid grid-cols-1 gap-6">
        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="text-blue-500 mr-2" size={20} />
            Recent Activity
            <span className="ml-2 text-xs text-gray-500">(Auto-syncs from extension)</span>
          </h3>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
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

      {/* Recent Interviews */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interviews</h3>
        {recentInterviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No interview sessions yet. Start practicing to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentInterviews.map((interview, idx) => (
              <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {interview.problemTitle || interview.problemId || 'Interview Session'}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span>{new Date(interview.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{interview.platform || 'Platform'}</span>
                      {interview.difficulty && (
                        <>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            interview.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            interview.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {interview.difficulty}
                          </span>
                        </>
                      )}
                    </div>
                    {interview.status && (
                      <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                        interview.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {interview.status}
                      </span>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-primary-500">
                      {interview.overallScore || interview.score || interview.report?.overallScore || 0}
                    </div>
                    <div className="text-xs text-gray-500">Overall Score</div>
                    {interview.duration && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(interview.duration / 60)}min
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detailed Scores */}
                {interview.scores && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {interview.scores.communication > 0 && (
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-600">Communication</div>
                        <div className="text-sm font-bold text-blue-700">{interview.scores.communication}/100</div>
                      </div>
                    )}
                    {interview.scores.technicalSkill > 0 && (
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-xs text-gray-600">Technical</div>
                        <div className="text-sm font-bold text-purple-700">{interview.scores.technicalSkill}/100</div>
                      </div>
                    )}
                    {interview.scores.problemUnderstanding > 0 && (
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-600">Problem Understanding</div>
                        <div className="text-sm font-bold text-green-700">{interview.scores.problemUnderstanding}/100</div>
                      </div>
                    )}
                    {interview.scores.codeQuality > 0 && (
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-xs text-gray-600">Code Quality</div>
                        <div className="text-sm font-bold text-orange-700">{interview.scores.codeQuality}/100</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Topics Covered */}
                {interview.topicsCovered && interview.topicsCovered.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Topics Covered:</div>
                    <div className="flex flex-wrap gap-1">
                      {interview.topicsCovered.map((topic, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {interview.strengths && interview.strengths.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">✓ Strengths:</div>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {interview.strengths.slice(0, 3).map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {interview.weaknesses && interview.weaknesses.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-orange-600 mb-1">⚠ Areas to Improve:</div>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {interview.weaknesses.slice(0, 3).map((weakness, i) => (
                          <li key={i}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Feedback */}
                {interview.feedback && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 mb-1">Feedback:</div>
                    <p className="text-sm text-gray-700 italic">"{interview.feedback}"</p>
                  </div>
                )}
                
                {/* Interview Metrics */}
                {(interview.questionsAsked || interview.hintsGiven || interview.testsPassed) && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                    {interview.questionsAsked > 0 && (
                      <span>💬 {interview.questionsAsked} questions</span>
                    )}
                    {interview.hintsGiven > 0 && (
                      <span>💡 {interview.hintsGiven} hints</span>
                    )}
                    {interview.testsPassed >= 0 && interview.totalTests > 0 && (
                      <span>✓ {interview.testsPassed}/{interview.totalTests} tests</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
                activity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
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
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900">{value}</span>
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
