import WhatIf from '../components/WhatIf'

const STUDENT_ID = 1

function WhatIfPage() {
  return (
    <div style={{ padding: "32px 24px", maxWidth: "700px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px", color: "#002855" }}>
        Explore Scenarios
      </h1>
      <WhatIf studentId={STUDENT_ID} />
    </div>
  )
}

export default WhatIfPage