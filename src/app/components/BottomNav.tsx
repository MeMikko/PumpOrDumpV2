"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const item = (path: "/" | "/quests" | "/leaderboard" | "/profile", label: string) => (
  <Link href={path}>


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-black border-t border-zinc-800 flex">
      {item("/", "Home")}
      {item("/quests", "Quests")}
      {item("/leaderboard", "Ranks")}
      {item("/profile", "Profile")}
    </nav>
  );
}
