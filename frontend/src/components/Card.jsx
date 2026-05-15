function Card({ children, title }) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
        padding: "20px",
        marginBottom: "20px"
      }}>
        {title && (
          <h2 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#002855",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    )
  }
  
  export default Card