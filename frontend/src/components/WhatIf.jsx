import { useState } from 'react'

const PROGRAMS = ["Statistics Minor"]

function WhatIf({ studentId }) {
  const [selectedProgram, setSelectedProgram] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleRun() {
    if (!selectedProgram) return
    setLoading(true)
    const res = await fetch(
      `http://localhost:8000/what-if/${studentId}?major=Computer Science&add_program=${encodeURIComponent(selectedProgram)}`
    )
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "12px" }}>What-If Scenario</h2>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "12px" }}>
        See how adding a minor affects your graduation plan
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <select
          value={selectedProgram}
          onChange={e => setSelectedProgram(e.target.value)}
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Select a program...</option>
          {PROGRAMS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={handleRun}
          disabled={!selectedProgram || loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#002855",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: selectedProgram ? "pointer" : "not-allowed",
            opacity: selectedProgram ? 1 : 0.5
          }}
        >
          {loading ? "..." : "Run"}
        </button>
      </div>

      {result && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
          <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#002855" }}>
                {result.current_remaining}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>CS only</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#c4a44a" }}>
                {result.combined_remaining}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>with {result.add_program}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#666" }}>
                +{result.extra_count}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>extra courses</div>
            </div>
          </div>

          {result.overlap_courses.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                ✅ Courses that count for both:
              </p>
              <ul style={{ paddingLeft: "20px", fontSize: "13px" }}>
                {result.overlap_courses.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
              📚 Additional courses needed:
            </p>
            <ul style={{ paddingLeft: "20px", fontSize: "13px" }}>
              {result.extra_courses_needed.map(c => <li key={c}>{c}</li>)}
            </ul>
          </div>

          {result.uncovered_prereqs.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                ⚠️ Prerequisite courses not yet covered:
              </p>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#c0392b" }}>
                {result.uncovered_prereqs.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WhatIf