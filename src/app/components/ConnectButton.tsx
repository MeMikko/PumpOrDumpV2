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
    (c) => c.id === "metaMask"
  );
  const walletConnect = connectors.find(
    (c) => c.id === "walletConnect"
  );

  function handleConnect() {
    // 🦊 1️⃣ Desktop MetaMask extension
    if (metaMask && metaMask.ready) {
      connect({ connector: metaMask });
      return;
    }

    // 🔗 2️⃣ Fallback: WalletConnect QR
    if (walletConnect) {
      connect({ connector: walletConnect });
      return;
    }

    console.warn("No wallet connector available");
  }

  return (
    <button
      disabled={isPending}
      onClick={handleConnect}
      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect"}
    </button>
  );
}
