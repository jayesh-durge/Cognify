import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import InterviewReports from './components/InterviewReports'
import Progress from './components/Progress'
import Login from './components/Login'
import Settings from './components/Settings'
import ExtensionSetup from './components/ExtensionSetup'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-500">
        <div className="text-white text-2xl font-bold">Loading Cognify...</div>
      </div>
    )
  }

  // Setup page is accessible to everyone
  return (
    <Routes>
      <Route path="/setup" element={<ExtensionSetup />} />
      
      {!user ? (
        <>
          <Route path="*" element={<Login />} />
        </>
      ) : (
        <>
          <Route path="/" element={
            <div className="min-h-screen bg-[#0f1419]">
              <Navbar />
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Dashboard />
              </main>
            </div>
          } />
          <Route path="/dashboard" element={
            <div className="min-h-screen bg-[#0f1419]">
              <Navbar />
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Dashboard />
              </main>
            </div>
          } />
          <Route path="/interviews" element={
            <div className="min-h-screen bg-[#0f1419]">
              <Navbar />
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                <InterviewReports />
              </main>
            </div>
          } />
          <Route path="/progress" element={
            <div className="min-h-screen bg-[#0f1419]">
              <Navbar />
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Progress />
              </main>
            </div>
          } />
          <Route path="/settings" element={
            <div className="min-h-screen bg-[#0f1419]">
              <Navbar />
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Settings />
              </main>
            </div>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
