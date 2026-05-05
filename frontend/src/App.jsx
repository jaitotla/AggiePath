import { useState, useEffect } from 'react'
import ProgressBar from './components/ProgressBar'
import RemainingCourses from './components/RemainingCourses'
import CourseForm from './components/CourseForm'
import AvailableCourses from './components/AvailableCourses'
import PlanView from './components/PlanView'
import CompletedCourseList from './components/CompletedCourseList'
import WhatIf from './components/WhatIf'

const STUDENT_ID = 1
const MAJOR = "Computer Science"

function App() {
  const [progress, setProgress] = useState(null)
  const [available, setAvailable] = useState([])
  const [plan, setPlan] = useState(null)
  const [completedCourses, setCompletedCourses] = useState([])
  const [unitsPerQuarter, setUnitsPerQuarter] = useState(16)
  const [maxRequired, setMaxRequired] = useState(3)

  async function fetchData() {
    const [progressRes, availableRes, planRes, completedRes] = await Promise.all([
      fetch(`http://localhost:8000/progress/${STUDENT_ID}?major=${MAJOR}`),
      fetch(`http://localhost:8000/available-courses/${STUDENT_ID}?major=${MAJOR}`),
      fetch(`http://localhost:8000/plan/${STUDENT_ID}?major=${MAJOR}&units_per_quarter=${unitsPerQuarter}&max_required_per_quarter=${maxRequired}`),
      fetch(`http://localhost:8000/completed-courses/${STUDENT_ID}`)
    ])

    const [progressData, availableData, planData, completedData] = await Promise.all([
      progressRes.json(),
      availableRes.json(),
      planRes.json(),
      completedRes.json()
    ])

    setProgress(progressData)
    setAvailable(availableData.available_courses)
    setPlan(planData)
    setCompletedCourses(completedData)
  }

  async function handleDelete(recordId) {
    await fetch(`http://localhost:8000/completed-courses/${recordId}`, {
      method: 'DELETE'
    })
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [unitsPerQuarter, maxRequired])

  if (!progress) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ marginBottom: "24px", color: "#002855" }}>🎓 AggiePath</h1>
      <CourseForm onCourseAdded={fetchData} />
      <CompletedCourseList courses={completedCourses} onDelete={handleDelete} />
      <ProgressBar percentage={progress.percentage} byCategory={progress.by_category} />
      <AvailableCourses courses={available} />

      <div style={{ marginBottom: "16px", padding: "16px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ marginBottom: "12px" }}>Plan Settings</h2>
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
      <WhatIf studentId={STUDENT_ID} />
      <PlanView plan={plan?.plan} quartersToGraduation={plan?.quarters_to_graduation} />
      <RemainingCourses byCategory={progress.by_category} />
    </div>
  )
}

export default App