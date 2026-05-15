import WhatIf from '../components/WhatIf'

function WhatIfPage({ studentId }) {
  return (
    <div style={{ padding: "32px 48px" }}>
      <h1 style={{
        fontSize: "22px",
        fontWeight: "700",
        marginBottom: "8px",
        color: "#002855"
      }}>
        Explore Scenarios
      </h1>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
        Simulate adding a minor or second major to see the impact on your graduation plan
      </p>
      <WhatIf studentId={studentId} />
    </div>
  )
}

export default WhatIfPage