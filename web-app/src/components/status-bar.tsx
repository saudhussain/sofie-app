import { cva } from 'class-variance-authority';
import type { ConnectionState } from '../types';

type ConnectionKind = ConnectionState['kind'];

// A new connection kind must be named here, or this map will not type-check.
const connectionStatusLabel = {
  connected: 'Connected',
  connecting: 'Connecting',
  'gateway-down': 'Gateway down',
  'rundown-inactive': 'Rundown not active',
} satisfies Record<ConnectionKind, string>;

const connectionStatusText = cva(
  'flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em]',
  {
    variants: {
      kind: {
        connected: 'text-ready',
        connecting: 'text-standby',
        'gateway-down': 'text-standby',
        'rundown-inactive': 'text-muted',
      } satisfies Record<ConnectionKind, string>,
    },
  }
);

const connectionStatusLamp = cva('size-1.5 rounded-full', {
  variants: {
    kind: {
      connected: 'bg-ready shadow-[0_0_8px_var(--color-ready)]',
      connecting: 'bg-standby shadow-[0_0_8px_var(--color-standby)]',
      'gateway-down': 'bg-standby shadow-[0_0_8px_var(--color-standby)]',
      'rundown-inactive': 'bg-muted',
    } satisfies Record<ConnectionKind, string>,
  },
});

type StatusBarProps = {
  connection: ConnectionState;
};

/** Connection lamp. The text is the accessible name. The colored dot is decorative. */
export const StatusBar = ({ connection: { kind } }: StatusBarProps) => (
  <header className="flex items-center justify-between gap-4 border border-line bg-panel px-5 py-3">
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="h-5 w-0.5 bg-cue" />
      <h1 className="font-semibold text-sm tracking-[0.32em]">SOFIE</h1>
    </div>
    {/* Announced on change. The dot stays hidden because color is not the name. */}
    <p aria-live="polite" className={connectionStatusText({ kind })}>
      <span aria-hidden="true" className={connectionStatusLamp({ kind })} />
      {connectionStatusLabel[kind]}
    </p>
  </header>
);
