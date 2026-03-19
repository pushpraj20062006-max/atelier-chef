import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fffbe6" }}>
      <h1 style={{ fontSize: 72, color: "#ff9900", marginBottom: 0 }}>404</h1>
      <h2 style={{ color: "#333", marginTop: 0 }}>Page Not Found</h2>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <span style={{ color: "#fff", background: "#ff9900", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
          Go Home
        </span>
      </Link>
    </div>
  );
}
