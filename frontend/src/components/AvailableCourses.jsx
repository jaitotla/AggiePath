import Card from './Card'

function AvailableCourses({ courses }) {
  return (
    <Card title="Available to Take Next">
      <p style={{ color: "#999", fontSize: "12px", marginBottom: "10px" }}>
        You meet the prerequisites for these courses
      </p>
      {courses.length === 0 ? (
        <p style={{ color: "#999", fontSize: "13px" }}>No courses available yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {courses.map(course => (
            <li key={course} style={{
              padding: "6px 0",
              borderBottom: "1px solid #f0f0f0",
              fontSize: "14px",
              color: "#002855",
              fontWeight: "500"
            }}>
              {course}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default AvailableCourses