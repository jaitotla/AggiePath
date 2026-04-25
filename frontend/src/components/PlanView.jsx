function PlanView({ plan, quartersToGraduation }) {
    if (!plan || plan.length === 0) return null
  
    return (
      <div style={{ marginBottom: "24px" }}>
        <h2>Graduation Plan</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
          Estimated {quartersToGraduation} quarters to graduation
        </p>
  
        {plan.map((quarter) => (
          <div key={quarter.quarter} style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: "white"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <h3 style={{ color: "#002855" }}>Quarter {quarter.quarter}</h3>
              <span style={{ color: "#666", fontSize: "14px" }}>
                {quarter.units} units
              </span>
            </div>
  
            <ul style={{ paddingLeft: "20px" }}>
                {quarter.courses.map((course, index) => {
                const isPlaceholder = !quarter.required_courses.includes(course)
                return (
                    <li key={`${course}-${index}`} style={{
                    marginBottom: "4px",
                    color: isPlaceholder ? "#aaa" : "#333",
                    fontStyle: isPlaceholder ? "italic" : "normal"
                    }}>
                    {course}
                    </li>
                )
                })}
            </ul>
          </div>
        ))}
      </div>
    )
  }
  
  export default PlanView