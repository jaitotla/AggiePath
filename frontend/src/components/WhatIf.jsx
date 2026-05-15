import { useState } from 'react'
import Card from './Card'

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
    <div style={{ display: "grid", gridTemplateColumns: "450px 1fr", gap: "24px", alignItems: "start" }}>

      {/* Left column — controls */}
      <div>
        <Card title="Select Program">
          <p style={{ fontSize: "13px", color: "#999", marginBottom: "12px" }}>
            See how adding a minor or second major affects your graduation timeline
          </p>
          <select
            value={selectedProgram}
            onChange={e => setSelectedProgram(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
              fontSize: "14px",
              backgroundColor: "white",
              marginBottom: "10px"
            }}
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
              width: "100%",
              padding: "10px",
              backgroundColor: selectedProgram ? "#002855" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: selectedProgram ? "pointer" : "not-allowed",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            {loading ? "Running..." : "Run Scenario"}
          </button>
        </Card>

        {result && (
          <Card title="Summary">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>CS only</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#002855" }}>
                  {result.current_remaining}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>With {result.add_program}</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#c4a44a" }}>
                  {result.combined_remaining}
                </span>
              </div>
              <div style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "13px", color: "#666" }}>Extra workload</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#555" }}>
                  +{result.extra_count} courses
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Right column — results */}
      <div>
        {!result && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            padding: "60px 20px",
            textAlign: "center",
            color: "#bbb"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎓</div>
            <p style={{ fontSize: "14px" }}>Select a program and click Run to see the impact</p>
          </div>
        )}

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {result.overlap_courses.length > 0 && (
              <Card title="Counts for Both Programs">
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {result.overlap_courses.map(c => (
                    <li key={c} style={{
                      padding: "6px 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "13px",
                      color: "#2e7d32",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      ✅ {c}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card title="Additional Courses Needed">
              <ul style={{ listStyle: "none", padding: 0 }}>
                {result.extra_courses_needed.map(c => (
                  <li key={c} style={{
                    padding: "6px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    color: "#444"
                  }}>
                    {c}
                  </li>
                ))}
              </ul>
            </Card>

            {result.uncovered_prereqs.length > 0 && (
              <Card title="Prerequisites Not Yet Covered">
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {result.uncovered_prereqs.map(c => (
                    <li key={c} style={{
                      padding: "6px 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "13px",
                      color: "#c0392b",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      ⚠️ {c}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WhatIf