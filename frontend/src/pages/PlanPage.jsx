import { useState, useEffect } from 'react'
import Card from '../components/Card'

const MAJOR = "Computer Science"

function PlanPage({ studentId }) {
  const [plan, setPlan] = useState(null)
  const [unitsPerQuarter, setUnitsPerQuarter] = useState(16)
  const [maxRequired, setMaxRequired] = useState(3)

  async function fetchPlan() {
    const res = await fetch(
      `https://aggiepath-backend.onrender.com/plan/${studentId}?major=${MAJOR}&units_per_quarter=${unitsPerQuarter}&max_required_per_quarter=${maxRequired}`
    )
    const data = await res.json()
    setPlan(data)
  }

  useEffect(() => {
    fetchPlan()
  }, [studentId, unitsPerQuarter, maxRequired])

  return (
    <div style={{ padding: "32px 48px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px", color: "#002855" }}>
        Graduation Plan
      </h1>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
        A suggested quarter-by-quarter schedule based on your completed courses and prerequisites
      </p>

      <Card title="Plan Settings">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", color: "#444" }}>Units per quarter</label>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#002855" }}>{unitsPerQuarter}</span>
            </div>
            <input type="range" min="12" max="20" step="1"
              value={unitsPerQuarter}
              onChange={e => setUnitsPerQuarter(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#bbb" }}>
              <span>12</span><span>20</span>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", color: "#444" }}>Major courses per quarter</label>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#002855" }}>{maxRequired}</span>
            </div>
            <input type="range" min="1" max="5" step="1"
              value={maxRequired}
              onChange={e => setMaxRequired(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#bbb" }}>
              <span>1</span><span>5</span>
            </div>
          </div>
        </div>

        {plan && (
          <div style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            gap: "32px"
          }}>
            <div>
              <span style={{ fontSize: "11px", color: "#999", letterSpacing: "0.5px" }}>QUARTERS TO GRADUATION</span>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#002855" }}>
                {plan.quarters_to_graduation}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#999", letterSpacing: "0.5px" }}>UNITS PER QUARTER</span>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#002855" }}>
                {unitsPerQuarter}
              </div>
            </div>
          </div>
        )}
      </Card>

      {plan && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {plan.plan.map((quarter) => (
            <div key={quarter.quarter} style={{
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              padding: "20px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#002855" }}>
                  Quarter {quarter.quarter}
                </h3>
                <span style={{
                  fontSize: "11px",
                  backgroundColor: "#f0f4f8",
                  color: "#666",
                  padding: "2px 8px",
                  borderRadius: "20px"
                }}>
                  {quarter.units} units
                </span>
              </div>

              <ul style={{ listStyle: "none", padding: 0 }}>
                {quarter.courses.map((course, index) => {
                  const isPlaceholder = !quarter.required_courses.includes(course)
                  return (
                    <li key={`${course}-${index}`} style={{
                      padding: "5px 0",
                      borderBottom: "1px solid #f5f5f5",
                      fontSize: "13px",
                      color: isPlaceholder ? "#bbb" : "#333",
                      fontStyle: isPlaceholder ? "italic" : "normal",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      {!isPlaceholder && (
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#002855",
                          display: "inline-block",
                          flexShrink: 0
                        }} />
                      )}
                      {course}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlanPage