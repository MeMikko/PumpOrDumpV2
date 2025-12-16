"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type NavPath = "/" | "/quests" | "/leaderboard" | "/profile";

export default function BottomNav() {
  const pathname = usePathname();

  const item = (path: NavPath, label: string) => (
    <Link
      key={path}
      href={path as Route}
      className={`flex-1 text-center py-3 text-sm font-bold transition ${
        pathname === path ? "text-cyan-400" : "text-zinc-400"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-black border-t border-zinc-800 flex">
      {item("/", "Home")}
      {item("/quests", "Quests")}
      {item("/leaderboard", "Ranks")}
      {item("/profile", "Profile")}
    </nav>
  );
}
