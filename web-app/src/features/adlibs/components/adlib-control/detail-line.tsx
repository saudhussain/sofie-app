import { type FireTone, fireToneClass } from '../../hooks/use-adlib-fire';

/**
 * The second line of a control.
 * A fire status replaces the credit or subtitle for as long as that status
 * shows. Idle with neither credit nor subtitle draws nothing.
 */
export function DetailLine({
  detail,
  statusText,
  tone,
}: {
  detail?: string;
  statusText?: string;
  tone?: FireTone;
}) {
  if (statusText) {
    return (
      <p
        className={`truncate font-mono text-[11px] uppercase tracking-[0.14em] ${fireToneClass[tone ?? 'standby'].text}`}
      >
        {statusText}
      </p>
    );
  }
  if (!detail) {
    return null;
  }
  return <p className="truncate text-muted text-sm">{detail}</p>;
}
