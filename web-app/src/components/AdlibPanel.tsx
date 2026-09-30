type AdlibPanelProps = {
  headingId: string;
  title: string;
  emptyMessage: string;
};

export function AdlibPanel({
  headingId,
  title,
  emptyMessage,
}: AdlibPanelProps) {
  return (
    <section
      className="flex h-full min-h-56 flex-col border border-line bg-panel"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="border-b border-line px-5 py-3 font-mono text-[11px] font-medium tracking-[0.2em] text-muted uppercase"
      >
        {title}
      </h2>
      <p className="px-5 py-6 font-mono text-sm text-muted">{emptyMessage}</p>
    </section>
  );
}
