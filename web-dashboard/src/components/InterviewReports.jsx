import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getInterviewReports } from '../services/firebase'
import { Trophy, Clock, Calendar, TrendingUp, MessageSquare, Code, Target, ChevronDown, ChevronUp } from 'lucide-react'

export default function InterviewReports() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadInterviews()
  }, [user])

  const loadInterviews = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await getInterviewReports(user.uid, 50)
    setInterviews(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading interviews...</div>
      </div>
    )
  }

  if (interviews.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Interview Reports</h1>
          <p className="text-gray-400 mt-1">Your completed interviews will appear here</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-700 text-center">
          <Trophy className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-white mb-2">No Interviews Yet</h3>
          <p className="text-gray-400">
            Complete your first interview in the extension to see detailed reports and track your progress!
          </p>
        </div>
      </div>
    )
  }

  // Calculate overall stats
  const avgOverall = Math.round(
    interviews.reduce((sum, i) => sum + (i.scores?.overall || i.overallScore || 0), 0) / interviews.length
  )
  const avgCommunication = Math.round(
    interviews.reduce((sum, i) => sum + (i.scores?.communication || 0), 0) / interviews.length
  )
  const avgTechnical = Math.round(
    interviews.reduce((sum, i) => sum + (i.scores?.technical || 0), 0) / interviews.length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Interview Reports</h1>
        <p className="text-gray-400 mt-1">Detailed analysis of all your mock interviews</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="text-yellow-500" />}
          label="Total Interviews"
          value={interviews.length}
        />
        <StatCard
          icon={<Target className="text-purple-500" />}
          label="Avg Overall Score"
          value={`${avgOverall}/100`}
        />
        <StatCard
          icon={<MessageSquare className="text-green-500" />}
          label="Avg Communication"
          value={`${avgCommunication}/100`}
        />
        <StatCard
          icon={<Code className="text-orange-500" />}
          label="Avg Technical"
          value={`${avgTechnical}/100`}
        />
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            expanded={expandedId === interview.id}
            onToggle={() => setExpandedId(expandedId === interview.id ? null : interview.id)}
          />
        ))}
      </div>
    </div>
  )
}

function InterviewCard({ interview, expanded, onToggle }) {
  const overallScore = interview.scores?.overall || interview.overallScore || 0
  const communicationScore = interview.scores?.communication || 0
  const technicalScore = interview.scores?.technical || 0
  
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    if (score >= 30) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-500/20 border-green-500/30'
    if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30'
    if (score >= 30) return 'bg-orange-500/20 border-orange-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {interview.problemTitle || 'Interview Session'}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                interview.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                interview.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {interview.difficulty || 'Medium'}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
                {interview.platform || 'LeetCode'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(interview.timestamp).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {Math.round((interview.duration || 0) / 60000)} min
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                {interview.questionsAsked || 0} questions
              </span>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg border ${getScoreBg(overallScore)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}/100
                </div>
                <div className="text-xs text-gray-400 mt-1">Overall</div>
              </div>
            </div>
            
            <button className="text-gray-400 hover:text-white transition-colors">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-700 p-6 bg-gray-800/50">
          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ScoreDetail
              label="Overall Performance"
              score={overallScore}
              icon={<Target size={18} />}
              color="purple"
            />
            <ScoreDetail
              label="Communication"
              score={communicationScore}
              icon={<MessageSquare size={18} />}
              color="green"
            />
            <ScoreDetail
              label="Technical Skills"
              score={technicalScore}
              icon={<Code size={18} />}
              color="orange"
            />
          </div>

          {/* Questions & Scores */}
          {interview.questionScores && interview.questionScores.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare size={16} />
                Interview Questions & Performance
              </h4>
              <div className="space-y-3">
                {interview.questionScores.map((qs, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-300 mb-1">
                          Question {qs.questionNumber || idx + 1}
                        </p>
                        <p className="text-xs text-gray-400 italic">"{qs.question}"</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          Comm: {qs.scores?.communication || 0}/100
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                          Tech: {qs.scores?.technical || 0}/100
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Overall: {qs.scores?.overall || 0}/100
                        </span>
                      </div>
                    </div>
                    {qs.answer && (
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Answer:</span> {qs.answer.substring(0, 200)}
                        {qs.answer.length > 200 ? '...' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {interview.strengths && interview.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {interview.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/20"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Areas to Improve */}
          {interview.areasToImprove && interview.areasToImprove.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-2">⚡ Areas to Improve</h4>
              <div className="flex flex-wrap gap-2">
                {interview.areasToImprove.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs border border-orange-500/20"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {interview.feedback && (
            <div className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
              <h4 className="text-sm font-semibold text-white mb-2">📝 Feedback</h4>
              <p className="text-sm text-gray-300">{interview.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreDetail({ label, score, icon, color }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400'
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold">{score}/100</div>
      <div className="mt-2 bg-gray-900/50 rounded-full h-2">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${
            color === 'purple' ? 'from-purple-500 to-purple-400' :
            color === 'green' ? 'from-green-500 to-green-400' :
            'from-orange-500 to-orange-400'
          }`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  )
}
