import Card from './Card'

function CSElectives({ electives }) {
  return (
    <Card title="Electives Taken">
      {!electives || electives.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#999" }}>No CS electives recorded yet.</p>
      ) : (
        <>
          <p style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            CS courses outside your core requirements
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {electives.map(course => (
              <li key={course} style={{
                padding: "6px 0",
                borderBottom: "1px solid #f0f0f0",
                fontSize: "13px",
                color: "#002855",
                fontWeight: "500"
              }}>
                {course}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            {electives.length} elective{electives.length !== 1 ? "s" : ""} taken
          </p>
        </>
      )}
    </Card>
  )
}

export default CSElectives