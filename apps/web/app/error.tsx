"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#b91c1c", marginBottom: "1rem" }}>Something went wrong</h2>
      <pre style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", overflow: "auto", fontSize: "12px" }}>
        {error.message}
        {error.stack && `\n\n${error.stack}`}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
