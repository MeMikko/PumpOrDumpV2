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
    <div className="pod-onboard">
      <div className="pod-onboard__card">
        <h2>Welcome to Pump or Dump</h2>

        <ul>
          <li>Vote on trending tokens</li>
          <li>Earn XP from correct predictions</li>
          <li>Climb the leaderboard</li>
        </ul>

        <button
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
