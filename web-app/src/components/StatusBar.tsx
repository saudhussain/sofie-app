export function StatusBar() {
  return (
    <header className="flex items-center justify-between gap-4 border border-line bg-panel px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="h-5 w-0.5 bg-cue" aria-hidden="true" />
        <h1 className="text-sm font-semibold tracking-[0.32em]">SOFIE</h1>
      </div>
      <p className="flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] text-standby uppercase">
        <span
          className="size-1.5 rounded-full bg-standby shadow-[0_0_8px_var(--color-standby)]"
          aria-hidden="true"
        />
        Not connected
      </p>
    </header>
  );
}
