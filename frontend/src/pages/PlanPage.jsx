import { useState, useEffect } from 'react'
import PlanView from '../components/PlanView'

const STUDENT_ID = 1
const MAJOR = "Computer Science"

function PlanPage() {
  const [plan, setPlan] = useState(null)
  const [unitsPerQuarter, setUnitsPerQuarter] = useState(16)
  const [maxRequired, setMaxRequired] = useState(3)

  async function fetchPlan() {
    const res = await fetch(
      `http://localhost:8000/plan/${STUDENT_ID}?major=${MAJOR}&units_per_quarter=${unitsPerQuarter}&max_required_per_quarter=${maxRequired}`
    )
    const data = await res.json()
    setPlan(data)
  }

  useEffect(() => {
    fetchPlan()
  }, [unitsPerQuarter, maxRequired])

  return (
    <div style={{ padding: "32px 24px", maxWidth: "700px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px", color: "#002855" }}>
        Graduation Plan
      </h1>

      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ marginBottom: "12px", fontSize: "16px" }}>Plan Settings</h2>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label>Units per quarter</label>
            <span style={{ color: "#002855", fontWeight: "bold" }}>{unitsPerQuarter}</span>
          </div>
          <input type="range" min="12" max="20" step="1"
            value={unitsPerQuarter}
            onChange={e => setUnitsPerQuarter(Number(e.target.value))}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label>Major courses per quarter</label>
            <span style={{ color: "#002855", fontWeight: "bold" }}>{maxRequired}</span>
          </div>
          <input type="range" min="1" max="5" step="1"
            value={maxRequired}
            onChange={e => setMaxRequired(Number(e.target.value))}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </div>
      </div>

      <PlanView plan={plan?.plan} quartersToGraduation={plan?.quarters_to_graduation} />
    </div>
  )
}

export default PlanPage