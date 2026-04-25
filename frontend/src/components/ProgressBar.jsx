function ProgressBar({ percentage, byCategory }) {
    const categoryLabels = {
      math: "Math",
      lower_div_cs: "Lower Division CS",
      upper_div_cs: "Upper Division CS",
      science: "Science"
    }
  
    return (
      <div style={{ marginBottom: "24px" }}>
        <h2>Degree Progress</h2>
        <p style={{ marginBottom: "8px" }}>{percentage}% overall complete</p>
  
        <div style={{ backgroundColor: "#ddd", borderRadius: "8px", height: "20px", marginBottom: "16px" }}>
          <div style={{
            backgroundColor: "#002855",
            width: `${percentage}%`,
            height: "100%",
            borderRadius: "8px",
            transition: "width 0.3s ease"
          }} />
        </div>
  
        {byCategory && Object.entries(byCategory).map(([key, data]) => (
          <div key={key} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>{categoryLabels[key] || key}</span>
              <span style={{ color: "#666" }}>{data.completed}/{data.total}</span>
            </div>
            <div style={{ backgroundColor: "#ddd", borderRadius: "4px", height: "8px" }}>
              <div style={{
                backgroundColor: "#c4a44a",
                width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%`,
                height: "100%",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  export default ProgressBar