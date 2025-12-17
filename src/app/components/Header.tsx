"use client";

import Link from "next/link";
import { useConnect, useDisconnect } from "wagmi";
import { useAuthGate } from "@/identity/useAuthGate";

function shortAddr(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Header() {
  const auth = useAuthGate();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black">
      <Link href="/" className="font-bold text-xl tracking-widest">
        PUMP OR DUMP
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {/* 🟣 MiniApp: ei nappeja */}
        {auth.state === "miniapp" && auth.identity && (
          <>
            {auth.identity.pfpUrl && (
              <img
                src={auth.identity.pfpUrl}
                className="h-6 w-6 rounded-full"
                alt=""
              />
            )}
            <span>{auth.identity.displayName}</span>
            <span className="h-2 w-2 rounded-full bg-green-500" />
          </>
        )}

        {/* 🧩 Wallet puuttuu */}
        {auth.state === "needs-wallet" && (
          <button
            disabled={isPending}
            onClick={() => {
              const injected = connectors.find(c => c.id === "injected");
              if (injected) connect({ connector: injected });
            }}
          >
            {isPending ? "CONNECTING…" : "CONNECT WALLET"}
          </button>
        )}

        {/* ✅ Valmis */}
        {auth.state === "ready" && auth.identity && (
          <>
            {auth.identity.pfpUrl && (
              <img
                src={auth.identity.pfpUrl}
                className="h-6 w-6 rounded-full"
                alt=""
              />
            )}
            <span>
              {auth.identity.type === "wallet"
                ? shortAddr(auth.identity.address)
                : auth.identity.displayName}
            </span>
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <button onClick={() => disconnect()}>DISCONNECT</button>
          </>
        )}
      </div>
    </header>
  );
}
