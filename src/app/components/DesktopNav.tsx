"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";

export default function DesktopNav() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 font-semibold transition ${
      pathname === path
        ? "text-cyan-400"
        : "text-zinc-400 hover:text-white"
    }`;

  return (
    <nav className="w-full h-16 flex items-center justify-between bg-black/60 backdrop-blur border-b border-zinc-800 px-8">
      {/* Vasemmat linkit */}
      <div className="flex items-center gap-6">
        <Link href="/" className={linkClass("/")}>Home</Link>
        <Link href="/quests" className={linkClass("/quests")}>Quests</Link>
        <Link href="/leaderboard" className={linkClass("/leaderboard")}>Leaderboard</Link>
        <Link href="/profile" className={linkClass("/profile")}>Profile</Link>
      </div>

      {/* Oikea puoli */}
      <ConnectButton />
    </nav>
  );
}
