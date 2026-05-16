import { useState } from 'react'
import Card from './Card'

function CourseForm({ onCourseAdded, studentId }) {
  const [courseId, setCourseId] = useState('')
  const [term, setTerm] = useState('')
  const [grade, setGrade] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const res = await fetch('http://localhost:8000/completed-courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: null,
        student_id: studentId,
        course_id: courseId,
        term: term,
        grade: grade
      })
    })
    if (res.ok) {
      setCourseId('')
      setTerm('')
      setGrade('')
      onCourseAdded()
    } else {
      const data = await res.json()
      setError(data.detail)
    }
  }

  return (
    <Card title="Add Completed Course">
      {error && <p style={{ color: "red", marginBottom: "8px", fontSize: "13px" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="text"
          placeholder="Course ID (e.g. ECS 36A)"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e0e0e0", fontSize: "14px" }}
        />
        <input
          type="text"
          placeholder="Term (e.g. Fall 2024)"
          value={term}
          onChange={e => setTerm(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e0e0e0", fontSize: "14px" }}
        />
        <input
          type="text"
          placeholder="Grade (e.g. A)"
          value={grade}
          onChange={e => setGrade(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e0e0e0", fontSize: "14px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#002855",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          Add Course
        </button>
      </form>
    </Card>
  )
}

export default CourseForm