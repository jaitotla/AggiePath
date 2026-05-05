import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import WhatIfPage from './pages/WhatIfPage'
import PlanPage from './pages/PlanPage'

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/what-if" element={<WhatIfPage />} />
          <Route path="/plan" element={<PlanPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App