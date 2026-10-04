import type { ReactNode } from 'react';

/**
 * One column of the board.
 * `count` is how many gateway adlibs that column is showing. Callers omit it
 * while the panel is blocked, so a stale total is not left beside the waiting copy.
 */
export const PanelShell = ({
  children,
  count,
  headingId,
  title,
}: {
  children: ReactNode;
  count?: number;
  headingId: string;
  title: string;
}) => (
  <section
    aria-labelledby={headingId}
    className="flex h-full min-h-0 min-w-0 flex-col border border-line bg-panel"
  >
    <h2
      className="flex shrink-0 items-center justify-between border-line border-b px-5 py-3 font-medium font-mono text-[11px] text-muted uppercase tracking-[0.2em]"
      id={headingId}
    >
      <span>{title}</span>
      {typeof count === 'number' ? <span>{count}</span> : null}
    </h2>
    {children}
  </section>
);

/** Heading for one layer or global section. `count` is the adlibs under it. */
export const PanelSubheading = ({
  count,
  title,
}: {
  count: number;
  title: string;
}) => (
  <h3 className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted uppercase tracking-[0.16em]">
    <span>{title}</span>
    <span>{count}</span>
  </h3>
);

/** The sentence a panel shows when it has no buttons to press. */
export const EmptyLine = ({ message }: { message: string }) => (
  <p className="px-5 py-6 font-mono text-muted text-sm">{message}</p>
);
