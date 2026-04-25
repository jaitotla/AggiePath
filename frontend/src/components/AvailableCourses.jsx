function AvailableCourses({ courses }) {
    return (
      <div style={{ marginBottom: "24px" }}>
        <h2>Available to Take Next</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
          You meet the prerequisites for these courses
        </p>
        {courses.length === 0 ? (
          <p style={{ color: "#666" }}>No courses available yet.</p>
        ) : (
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            {courses.map(course => (
              <li key={course} style={{
                marginBottom: "6px",
                color: "#002855",
                fontWeight: "500"
              }}>
                {course}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  
  export default AvailableCourses