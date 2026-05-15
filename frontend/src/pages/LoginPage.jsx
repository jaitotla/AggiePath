import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage({ onLogin }) {
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !studentId.trim()) {
      setError('Please fill in all fields')
      return
    }
    onLogin({ name, studentId: parseInt(studentId) })
    navigate('/onboarding', { replace: true })
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#002855",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "48px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎓</div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#002855", letterSpacing: "2px" }}>
            AGGIEPATH
          </h1>
          <p style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
            UC Davis Graduation Planner
          </p>
        </div>

        {error && (
          <p style={{
            color: "#c0392b",
            fontSize: "13px",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#666", fontWeight: "600", letterSpacing: "0.5px" }}>
              FULL NAME
            </label>
            <input
              type="text"
              placeholder="e.g. Jai Totla"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
                marginTop: "4px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#666", fontWeight: "600", letterSpacing: "0.5px" }}>
              STUDENT ID
            </label>
            <input
              type="number"
              placeholder="e.g. 1234567"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
                marginTop: "4px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "8px",
              padding: "12px",
              backgroundColor: "#002855",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "0.5px"
            }}
          >
            GET STARTED →
          </button>
        </form>

        <p style={{ fontSize: "11px", color: "#ccc", textAlign: "center", marginTop: "24px" }}>
          For educational purposes only · UC Davis CS Dept
        </p>
      </div>
    </div>
  )
}

export default LoginPage