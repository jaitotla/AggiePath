import { useNavigate } from 'react-router-dom'

function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#002855", marginBottom: "8px" }}>
          Import Your Academic History
        </h1>
        <p style={{ fontSize: "15px", color: "#999" }}>
          Upload your transcript or manually enter your completed coursework to begin
        </p>
      </div>

      <div style={{ display: "flex", gap: "24px", marginBottom: "48px" }}>
        {/* Manual Entry Card */}
        <div
          onClick={() => navigate('/')}
          style={{
            backgroundColor: "white",
            border: "2px dashed #ddd",
            borderRadius: "12px",
            padding: "48px 40px",
            width: "240px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#002855"
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,40,85,0.1)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#ddd"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📝</div>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#002855", marginBottom: "8px" }}>
            Manual Entry
          </h2>
          <p style={{ fontSize: "13px", color: "#999", lineHeight: "1.5" }}>
            Add courses one by one from the dashboard
          </p>
        </div>

        {/* Upload Image Card */}
        <div
          onClick={() => navigate('/upload')}
          style={{
            backgroundColor: "white",
            border: "2px dashed #ddd",
            borderRadius: "12px",
            padding: "48px 40px",
            width: "240px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#002855"
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,40,85,0.1)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#ddd"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📷</div>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#002855", marginBottom: "8px" }}>
            Upload Transcript
          </h2>
          <p style={{ fontSize: "13px", color: "#999", lineHeight: "1.5" }}>
            Scan or upload an image of your transcript
          </p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage