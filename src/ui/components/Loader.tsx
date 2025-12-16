export function Loader() {
  return (
    <div className="flex items-center justify-center" aria-live="polite" aria-busy="true">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  );
}
