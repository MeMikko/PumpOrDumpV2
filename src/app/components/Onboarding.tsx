"use client";

import { useEffect, useState } from "react";

export default function Onboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("onboarded");
    if (!seen) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          maxWidth: 320,
          width: "90%",
          background: "#050617",
          border: "2px solid #1f2937",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>
          Welcome to Pump or Dump
        </h2>

        <p style={{ fontSize: 10, color: "#9ca3af" }}>
          Vote on trending tokens and earn XP from correct predictions.
        </p>

        <ul
          style={{
            margin: "12px 0",
            paddingLeft: 16,
            fontSize: 10,
            color: "#9ca3af",
            textAlign: "left",
          }}
        >
          <li>Tap <strong>PUMP</strong> if price goes up</li>
          <li>Tap <strong>DUMP</strong> if price goes down</li>
          <li>Climb the leaderboard</li>
        </ul>

        <button
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 44,
            border: "2px solid #22d3ee",
            color: "#22d3ee",
            background: "transparent",
          }}
          onClick={() => {
            localStorage.setItem("onboarded", "1");
            setOpen(false);
          }}
        >
          Start voting
        </button>
      </div>
    </div>
  );
}
