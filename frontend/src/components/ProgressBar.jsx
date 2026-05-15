import Card from './Card'

function ProgressBar({ percentage, byCategory }) {
  const categoryLabels = {
    math: "Math",
    lower_div_cs: "Lower Division CS",
    upper_div_cs: "Upper Division CS",
    science: "Science"
  }

  return (
    <Card title="Degree Progress">
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
        {percentage}% overall complete
      </p>
      <div style={{ backgroundColor: "#eee", borderRadius: "8px", height: "10px", marginBottom: "20px" }}>
        <div style={{
          backgroundColor: "#002855",
          width: `${percentage}%`,
          height: "100%",
          borderRadius: "8px",
          transition: "width 0.3s ease"
        }} />
      </div>

      {byCategory && Object.entries(byCategory).map(([key, data]) => (
        <div key={key} style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", color: "#444" }}>{categoryLabels[key] || key}</span>
            <span style={{ fontSize: "13px", color: "#999" }}>{data.completed}/{data.total}</span>
          </div>
          <div style={{ backgroundColor: "#eee", borderRadius: "4px", height: "6px" }}>
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
    </Card>
  )
}

export default ProgressBar