import { NavLink } from 'react-router-dom'

function Navbar({ user }) {
  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: isActive ? "600" : "400",
    color: isActive ? "white" : "#ccc",
    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent"
  })

  return (
    <nav style={{
      backgroundColor: "#002855",
      borderBottom: "3px solid #c4a44a",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      height: "72px",
      gap: "8px"
    }}>
      {/* Branding */}
      <div style={{ marginRight: "32px" }}>
        <div style={{
          color: "white",
          fontWeight: "800",
          fontSize: "18px",
          letterSpacing: "1.5px"
        }}>
          🎓 AGGIEPATH
        </div>
        <div style={{
          color: "#c4a44a",
          fontSize: "10px",
          letterSpacing: "1px",
          marginTop: "1px"
        }}>
          UC DAVIS
        </div>
      </div>

      {/* Nav links */}
      <NavLink to="/" end style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/what-if" style={linkStyle}>What-If</NavLink>
      <NavLink to="/plan" style={linkStyle}>Plan</NavLink>

      {/* User */}
      {user && (
        <span style={{
          marginLeft: "auto",
          color: "#ccc",
          fontSize: "13px"
        }}>
          👤 {user.name}
        </span>
      )}
    </nav>
  )
}

export default Navbar