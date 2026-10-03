import Card from './Card'

function ElectiveGroupProgress({ electiveGroups }) {
  if (!electiveGroups || Object.keys(electiveGroups).length === 0) return null

  const groupLabels = {
    science: "Science Electives"
  }

  return (
    <Card title="Elective Requirements">
      {Object.entries(electiveGroups).map(([groupName, data]) => (
        <div key={groupName} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", color: "#444" }}>
              {groupLabels[groupName] || groupName}
            </span>
            <span style={{ fontSize: "13px", color: "#999" }}>
              {Math.min(data.completed.length, data.courses_needed)}/{data.courses_needed} needed
            </span>
          </div>
          <div style={{ backgroundColor: "#eee", borderRadius: "4px", height: "6px", marginBottom: "8px" }}>
            <div style={{
              backgroundColor: "#c4a44a",
              width: `${Math.min(data.completed.length / data.courses_needed, 1) * 100}%`,
              height: "100%",
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }} />
          </div>
          {data.completed.length > 0 && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              Completed: {data.completed.join(", ")}
            </div>
          )}
          {data.remaining_needed > 0 && (
            <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
              Need {data.remaining_needed} more from: PHY 9A/9B/9C, CHE 2A/2B/2C, BIS 2A/2B/2C, BIO 1/2/3
            </div>
          )}
        </div>
      ))}
    </Card>
  )
}

export default ElectiveGroupProgress