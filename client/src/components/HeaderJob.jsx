export default function HeaderJob({ onBack }) {
  return (
    <header
      style={{
        backgroundColor: "#f5f0e6",
        padding: "0.8rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "3px solid #000413",
      }}
    >
      <h1
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: "2rem",
          letterSpacing: "2px",
          margin: 0,
          color: "#000413",
        }}
      >
        INCOLLEGE
      </h1>

      <button
        onClick={onBack}
        style={{
          backgroundColor: "#000413",
          color: "#e5e7eb",
          border: "none",
          padding: "0.6rem 1.3rem",
          borderRadius: "999px",
          fontSize: "0.95rem",
          cursor: "pointer",
          fontFamily: "'Epilogue', sans-serif",
        }}
      >
        ← Back to Jobs/Internships Menu
      </button>
    </header>
  );
}
