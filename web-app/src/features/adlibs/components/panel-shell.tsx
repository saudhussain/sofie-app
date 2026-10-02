import type { ReactNode } from 'react';

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

export const EmptyLine = ({ message }: { message: string }) => (
  <p className="px-5 py-6 font-mono text-muted text-sm">{message}</p>
);
