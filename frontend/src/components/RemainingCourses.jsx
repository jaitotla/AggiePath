function RemainingCourses({ byCategory }) {
    const categoryLabels = {
      math: "Math",
      lower_div_cs: "Lower Division CS",
      upper_div_cs: "Upper Division CS",
      science: "Science"
    }
  
    return (
      <div style={{ marginBottom: "24px" }}>
        <h2>Remaining Courses</h2>
        {byCategory && Object.entries(byCategory).map(([key, data]) => (
          data.remaining.length > 0 && (
            <div key={key} style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                {categoryLabels[key] || key}
              </h3>
              <ul style={{ paddingLeft: "20px" }}>
                {data.remaining.map(course => (
                  <li key={course} style={{ marginBottom: "4px" }}>{course}</li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    )
  }
  
  export default RemainingCourses