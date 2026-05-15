import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import WhatIfPage from './pages/WhatIfPage'
import PlanPage from './pages/PlanPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import UploadPage from './pages/UploadPage'

function App() {
  const [user, setUser] = useState(null)

  function handleLogin(userData) {
    setUser(userData)
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        {user && <Navbar user={user} />}
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/onboarding" /> : <LoginPage onLogin={handleLogin} />
          } />
          <Route path="/onboarding" element={
            user ? <OnboardingPage /> : <Navigate to="/login" />
          } />
          <Route path="/" element={
            user ? <Dashboard studentId={user.studentId} /> : <Navigate to="/login" />
          } />
          <Route path="/what-if" element={
            user ? <WhatIfPage studentId={user.studentId} /> : <Navigate to="/login" />
          } />
          <Route path="/plan" element={
            user ? <PlanPage studentId={user.studentId} /> : <Navigate to="/login" />
          } />
          <Route path="/upload" element={
          user ? <UploadPage studentId={user.studentId} /> : <Navigate to="/login" />
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App