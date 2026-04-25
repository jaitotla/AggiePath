import { useState } from 'react'

function CourseForm({ onCourseAdded }) {
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
        student_id: 1,
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
    <div style={{ marginBottom: "24px" }}>
      <h2>Add Completed Course</h2>
      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="text"
          placeholder="Course ID (e.g. ECS 36A)"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Term (e.g. Fall 2024)"
          value={term}
          onChange={e => setTerm(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Grade (e.g. A)"
          value={grade}
          onChange={e => setGrade(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{ padding: "8px", backgroundColor: "#002855", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add Course
        </button>
      </form>
    </div>
  )
}

export default CourseForm