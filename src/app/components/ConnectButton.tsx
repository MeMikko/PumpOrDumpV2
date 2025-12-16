"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
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

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black"
    >
      Connect
    </button>
  );
}
