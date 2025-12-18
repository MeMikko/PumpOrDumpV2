"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/useSession";

export default function MiniAppInit() {
  const { markReady } = useSession();

  useEffect(() => {
    markReady();
  }, [markReady]);

  return null;
}
