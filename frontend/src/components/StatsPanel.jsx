function StatsPanel({ unitsCompleted, quartersToGraduation }) {
    function estimateGraduation(quartersLeft) {
      if (!quartersLeft) return "N/A"
  
      // UC Davis quarters: Fall, Winter, Spring
      const quarters = ["Winter", "Spring", "Fall"]
      const currentQuarterIndex = 2  // Spring 2026
      let year = 2026
      let index = currentQuarterIndex
  
      for (let i = 0; i < quartersLeft; i++) {
        index = (index + 1) % 3
        if (index === 0) year++  // Winter starts new calendar year
      }
  
      return `${quarters[index]} ${year}`
    }
  
    const graduation = estimateGraduation(quartersToGraduation)
  
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "12px", color: "#666", letterSpacing: "1px", marginBottom: "8px" }}>
            EST. GRADUATION
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#002855" }}>
            {graduation}
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            {quartersToGraduation} quarters remaining
          </div>
        </div>
  
        <div style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "12px", color: "#666", letterSpacing: "1px", marginBottom: "8px" }}>
            UNITS COMPLETED
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#002855" }}>
            {unitsCompleted}
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            of major requirements
          </div>
        </div>
      </div>
    )
  }
  
  export default StatsPanel