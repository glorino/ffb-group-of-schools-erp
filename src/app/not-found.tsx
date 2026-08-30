import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(-45deg, #000a1f, #001f5f, #0039a6, #0055ff)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "120px",
          fontWeight: 800,
          margin: 0,
          lineHeight: 1,
          opacity: 0.15,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 700,
          margin: "16px 0 8px",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "rgba(255,255,255,0.6)",
          maxWidth: "420px",
          margin: "0 0 32px",
          lineHeight: 1.6,
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 32px",
          borderRadius: "14px",
          background: "#28ff9c",
          color: "#000",
          fontWeight: 700,
          fontSize: "15px",
          textDecoration: "none",
          transition: "all 0.2s ease",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
