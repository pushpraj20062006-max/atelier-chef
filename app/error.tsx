"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff0f0" }}>
        <h2 style={{ color: "#d32f2f" }}>Something went wrong!</h2>
        <p style={{ color: "#333" }}>{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset} style={{ margin: 16, padding: "10px 24px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600 }}>
          Try Again
        </button>
        <Link href="/">
          <span style={{ color: "#fff", background: "#1976d2", padding: "10px 24px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>
            Go Home
          </span>
        </Link>
      </body>
    </html>
  );
}
