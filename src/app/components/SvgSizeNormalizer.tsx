"use client";

import { useEffect } from "react";

export default function SvgSizeNormalizer() {
  useEffect(() => {
    document.querySelectorAll("svg").forEach((svg) => {
      if (!svg.getAttribute("viewBox")) {
        const w = svg.getAttribute("width");
        const h = svg.getAttribute("height");
        if (w && h) {
          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
      }
    });
  }, []);

  return null;
}
