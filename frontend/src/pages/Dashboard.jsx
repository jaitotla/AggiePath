import { useState, useEffect } from 'react'
import ProgressBar from '../components/ProgressBar'
import RemainingCourses from '../components/RemainingCourses'
import CourseForm from '../components/CourseForm'
import AvailableCourses from '../components/AvailableCourses'
import CompletedCourseList from '../components/CompletedCourseList'
import StatsPanel from '../components/StatsPanel'

const STUDENT_ID = 1
const MAJOR = "Computer Science"

function Dashboard() {
  const [progress, setProgress] = useState(null)
  const [available, setAvailable] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [plan, setPlan] = useState(null)

  async function fetchData() {
    const [progressRes, availableRes, completedRes, planRes] = await Promise.all([
      fetch(`http://localhost:8000/progress/${STUDENT_ID}?major=${MAJOR}`),
      fetch(`http://localhost:8000/available-courses/${STUDENT_ID}?major=${MAJOR}`),
      fetch(`http://localhost:8000/completed-courses/${STUDENT_ID}`),
      fetch(`http://localhost:8000/plan/${STUDENT_ID}?major=${MAJOR}&units_per_quarter=16&max_required_per_quarter=3`)
    ])
    const [progressData, availableData, completedData, planData] = await Promise.all([
      progressRes.json(),
      availableRes.json(),
      completedRes.json(),
      planRes.json()
    ])
    setProgress(progressData)
    setAvailable(availableData.available_courses)
    setCompletedCourses(completedData)
    setPlan(planData)
  }

  async function handleDelete(recordId) {
    await fetch(`http://localhost:8000/completed-courses/${recordId}`, {
      method: 'DELETE'
    })
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (!progress) return <p style={{ padding: "40px" }}>Loading...</p>

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px", color: "#002855" }}>
        Your Academic Progress
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: "24px" }}>
        {/* Left column */}
        <div>
          <CourseForm onCourseAdded={fetchData} />
          <CompletedCourseList courses={completedCourses} onDelete={handleDelete} />
          <ProgressBar percentage={progress.percentage} byCategory={progress.by_category} />
        </div>

        {/* Middle column */}
        <div>
          <AvailableCourses courses={available} />
          <RemainingCourses byCategory={progress.by_category} />
        </div>

        {/* Right column - stats */}
        <div>
          <StatsPanel
            unitsCompleted={progress.units_completed}
            quartersToGraduation={plan?.quarters_to_graduation}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard