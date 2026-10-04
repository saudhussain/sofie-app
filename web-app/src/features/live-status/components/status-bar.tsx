import type { ConnectionState } from '../types';

type ConnectionKind = ConnectionState['kind'];

// A new connection kind must be named here, or this map will not type-check.
const connectionStatus = {
  connected: {
    label: 'Connected',
    lamp: 'bg-ready shadow-[0_0_8px_var(--color-ready)]',
    text: 'text-ready',
  },
  connecting: {
    label: 'Connecting',
    lamp: 'bg-standby shadow-[0_0_8px_var(--color-standby)]',
    text: 'text-standby',
  },
  'gateway-down': {
    label: 'Gateway down',
    lamp: 'bg-standby shadow-[0_0_8px_var(--color-standby)]',
    text: 'text-standby',
  },
  'rundown-inactive': {
    label: 'Rundown not active',
    lamp: 'bg-muted',
    text: 'text-muted',
  },
} satisfies Record<
  ConnectionKind,
  { label: string; lamp: string; text: string }
>;

type StatusBarProps = {
  connection: ConnectionState;
};

/**
 * Connection lamp. The text is the accessible name. The colored dot is decorative.
 * Connecting covers the socket opening and the wait for the first `adLibs`
 * message. Gateway down is a closed socket. Rundown not active is a live
 * socket whose playlist id is null. Connected means both are ready.
 */
export const StatusBar = ({ connection: { kind } }: StatusBarProps) => {
  const status = connectionStatus[kind];
  return (
    <header className="flex items-center justify-between gap-4 border border-line bg-panel px-5 py-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-5 w-0.5 bg-cue" />
        <h1 className="font-semibold text-sm tracking-[0.32em]">SOFIE</h1>
      </div>
      {/* Announced on change. The dot stays hidden because color is not the name. */}
      <p
        aria-live="polite"
        className={`flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${status.text}`}
      >
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${status.lamp}`}
        />
        {status.label}
      </p>
    </header>
  );
};
