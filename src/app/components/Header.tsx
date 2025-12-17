"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black border-b-4 border-neon px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="pixel-text text-neon text-xl tracking-widest"
        >
          PUMP ▸ OR ▸ DUMP
        </Link>
      </div>
    </header>
  );
}
