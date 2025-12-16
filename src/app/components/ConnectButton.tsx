"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold"
      >
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </button>
    );
  }

  const metaMask = connectors.find(
    (c) => c.id === "metaMask" && c.ready
  );
  const walletConnect = connectors.find(
    (c) => c.id === "walletConnect"
  );

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (metaMask) {
          connect({ connector: metaMask }); // 🦊 extension
        } else if (walletConnect) {
          connect({ connector: walletConnect }); // 🔗 QR
        }
      }}
      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect"}
    </button>
  );
}
