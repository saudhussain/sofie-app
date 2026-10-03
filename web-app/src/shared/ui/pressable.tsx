import type { ReactNode } from 'react';

type PressableProps = {
  'aria-busy'?: boolean;
  'aria-current'?: 'true';
  'aria-label'?: string;
  'aria-live'?: 'polite';
  'aria-pressed'?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onFire?: () => void;
};

const buttonClass = (className: string | undefined): string =>
  ['touch-manipulation select-none', className]
    .filter((part) => part && part.length > 0)
    .join(' ');

/**
 * Plain button. A click calls onFire. The caller owns the border,
 * including the press highlight and the Sending / Sent colors.
 */
export const Pressable = ({
  'aria-busy': ariaBusy,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
  'aria-live': ariaLive,
  'aria-pressed': ariaPressed,
  children,
  className,
  disabled = false,
  onFire,
}: PressableProps) => (
  <button
    aria-busy={ariaBusy}
    aria-current={ariaCurrent}
    aria-label={ariaLabel}
    aria-live={ariaLive}
    aria-pressed={ariaPressed}
    className={buttonClass(className)}
    disabled={disabled}
    onClick={onFire}
    type="button"
  >
    {children}
  </button>
);

const chipToneClass = {
  danger: 'border-danger text-danger',
  ready: 'border-ready text-ready',
  standby: 'border-standby text-standby',
} as const;

/** A fire tone replaces the idle and selected frames while that status shows. */
const chipClass = (
  disabled: boolean | undefined,
  pressed: boolean | undefined,
  tone: keyof typeof chipToneClass | undefined
): string => {
  if (tone) {
    return chipToneClass[tone];
  }
  if (disabled) {
    return 'border-line text-muted';
  }
  const selected = pressed ? 'border-cue text-cue' : '';
  return `border-line text-ink active:border-cue ${selected}`;
};

/** Compact labeled button. A click does nothing until the caller passes onFire. */
export const Chip = ({
  busy = false,
  disabled,
  label,
  live = false,
  onFire,
  pressed,
  tone,
}: {
  busy?: boolean;
  disabled?: boolean;
  label: string;
  live?: boolean;
  onFire?: () => void;
  pressed?: boolean;
  tone?: keyof typeof chipToneClass;
}) => (
  <Pressable
    aria-busy={busy || undefined}
    aria-live={live ? 'polite' : undefined}
    aria-pressed={pressed}
    className={`min-h-12 truncate border px-2 font-mono text-[11px] uppercase tracking-[0.12em] ${chipClass(disabled, pressed, tone)}`}
    disabled={disabled}
    onFire={onFire}
  >
    {label}
  </Pressable>
);
