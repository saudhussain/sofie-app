import type { ReactNode } from 'react';

type PressableProps = {
  'aria-busy'?: boolean;
  'aria-current'?: 'true';
  'aria-label'?: string;
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
 * The only clickable control on the board.
 * `touch-manipulation` drops the browser's tap delay. The caller decides what
 * a tap means: a fire hook posts an adlib, a segment tab only changes the view.
 * A second tap while a request is in flight is ignored by that hook, not here.
 */
export const Pressable = ({
  'aria-busy': ariaBusy,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
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
    aria-pressed={ariaPressed}
    className={buttonClass(className)}
    disabled={disabled}
    onClick={onFire}
    type="button"
  >
    {children}
  </button>
);
