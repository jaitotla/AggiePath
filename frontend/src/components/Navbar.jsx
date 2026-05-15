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
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      height: "72px",
      gap: "8px"
    }}>
      <span style={{
        color: "white",
        fontWeight: "700",
        fontSize: "18px",
        marginRight: "24px",
        letterSpacing: "1px"
      }}>
        🎓 AGGIEPATH
      </span>
      <NavLink to="/" end style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/what-if" style={linkStyle}>What-If</NavLink>
      <NavLink to="/plan" style={linkStyle}>Plan</NavLink>

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