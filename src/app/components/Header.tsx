"use client";

import { useIdentity } from "@/identity/useIdentity";

function shortAddr(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function Header() {
  const identity = useIdentity();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black">
      <div className="font-bold text-xl tracking-widest">
        PUMP OR DUMP
      </div>

      {identity && (
        <div className="flex items-center gap-3 text-sm">
          {identity.type === "farcaster" ? (
            <>
              {identity.pfpUrl && (
                <img
                  src={identity.pfpUrl}
                  alt="pfp"
                  className="h-6 w-6 rounded-full"
                />
              )}

              <span>
                @{identity.username ?? `fid:${identity.fid}`}
              </span>

              <span className="h-2 w-2 rounded-full bg-green-500" />
            </>
          ) : (
            <>
              <span>{shortAddr(identity.address)}</span>
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </>
          )}
        </div>
      )}
    </header>
  );
}
