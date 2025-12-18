"use client";

import { useEffect, useState } from "react";

const KEY = "pod:signed-in";

export function useSession() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSignedIn(localStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  function markSignedIn() {
    localStorage.setItem(KEY, "1");
    setSignedIn(true);
  }

  return { signedIn, ready, markSignedIn };
}
