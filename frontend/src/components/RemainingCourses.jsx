import Card from './Card'

function RemainingCourses({ byCategory }) {
  const categoryLabels = {
    math: "Math",
    lower_div_cs: "Lower Division CS",
    upper_div_cs: "Upper Division CS",
    science: "Science"
  }

  return (
    <Card title="Remaining Courses">
      {byCategory && Object.entries(byCategory).map(([key, data]) => (
        data.remaining.length > 0 && (
          <div key={key} style={{ marginBottom: "14px" }}>
            <h3 style={{ fontSize: "11px", color: "#999", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {categoryLabels[key] || key}
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {data.remaining.map(course => (
                <li key={course} style={{
                  fontSize: "13px",
                  color: "#444",
                  padding: "4px 0",
                  borderBottom: "1px solid #f5f5f5"
                }}>
                  {course}
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </Card>
  )
}

export default RemainingCourses