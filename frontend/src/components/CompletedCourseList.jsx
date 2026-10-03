import Card from './Card'

function CompletedCourseList({ courses, onDelete }) {
  if (courses.length === 0) return null

  return (
    <Card title={`Completed Courses (${courses.length})`}>
      <ul style={{ listStyle: "none", padding: 0, maxHeight: "300px", overflowY: "auto" }}>
        {courses.map(course => (
          <li key={course.id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid #f0f0f0"
          }}>
            <div>
              <span style={{ fontWeight: "600", fontSize: "14px" }}>{course.course_id}</span>
              <span style={{ color: "#999", fontSize: "12px", marginLeft: "10px" }}>
                {course.term}{course.grade ? ` · ${course.grade}` : ''}
              </span>
            </div>
            <button
              onClick={() => onDelete(course.id)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #eee",
                borderRadius: "4px",
                color: "#bbb",
                cursor: "pointer",
                fontSize: "12px",
                padding: "2px 8px",
                flexShrink: 0
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default CompletedCourseList