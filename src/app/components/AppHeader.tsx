"use client";

export default function AppHeader() {
  return (
    <header className="relative overflow-hidden border-b-4 border-zinc-800 bg-black px-6 py-10">
      {/* CRT scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-10" />

      <div className="relative mx-auto max-w-6xl flex justify-center">
        <h1 className="font-pixel text-4xl sm:text-5xl text-neon-cyan drop-shadow-neon tracking-widest">
          PUMP <span className="text-neon-pink">OR</span> DUMP
        </h1>
      </div>
    </header>
  );
}
