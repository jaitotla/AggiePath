function CompletedCourseList({ courses, onDelete }) {
    if (courses.length === 0) return null
  
    return (
      <div style={{ marginBottom: "24px" }}>
        <h2>Completed Courses</h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "8px" }}>
          {courses.map(course => (
            <li key={course.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              marginBottom: "6px",
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}>
              <div>
                <span style={{ fontWeight: "500" }}>{course.course_id}</span>
                <span style={{ color: "#666", fontSize: "13px", marginLeft: "12px" }}>
                  {course.term} · {course.grade}
                </span>
              </div>
              <button
                onClick={() => onDelete(course.id)}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "2px 8px"
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  
  export default CompletedCourseList