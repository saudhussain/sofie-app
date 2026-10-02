import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HOLD_MS, useButtonPress } from './use-button-press';

type TooltipContent = {
  credit?: string;
  subtitle?: string;
  title: string;
};

type PressState = {
  holdHint?: string;
};

type PressableProps = {
  as?: 'button' | 'div';
  'aria-current'?: 'true';
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  children: ReactNode | ((state: PressState) => ReactNode);
  className?: string;
  disabled?: boolean;
  holdFill?: boolean;
  mode?: 'hold' | 'preview' | 'tap';
  onFire?: () => void;
  tooltip?: TooltipContent;
};

const HOLD_HINT_MS = 800;

/** A short tap on a hold control shows this, then clears. Nothing is sent. */
const useHoldHint = (): { show: () => void; text?: string } => {
  const [text, setText] = useState<string | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current !== undefined) {
        window.clearTimeout(timer.current);
      }
    },
    []
  );

  const show = useCallback(() => {
    setText('Hold');
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setText(undefined);
    }, HOLD_HINT_MS);
  }, []);

  return { show, text };
};

function TitlePopup({
  credit,
  rect,
  subtitle,
  title,
}: {
  credit?: string;
  rect: DOMRect;
  subtitle?: string;
  title: string;
}) {
  return (
    <div
      className="fixed z-30 max-w-sm border border-line bg-panel px-3 py-2 text-left shadow-[0_8px_24px_rgb(0_0_0/0.45)]"
      role="tooltip"
      style={{
        left: Math.min(rect.left, window.innerWidth - 320),
        top: Math.max(rect.top, 12),
        transform: 'translateY(-100%)',
      }}
    >
      <p className="text-sm">{title}</p>
      {subtitle ? <p className="text-muted text-xs">{subtitle}</p> : null}
      {credit && credit !== subtitle ? (
        <p className="text-muted text-xs">{credit}</p>
      ) : null}
    </div>
  );
}

function HoldFill({ pressing }: { pressing: boolean }) {
  if (!pressing) {
    return null;
  }
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-full origin-left animate-[hold-fill_linear_forwards] bg-danger/35"
      style={{ animationDuration: `${HOLD_MS}ms` }}
    />
  );
}

const touchClass = (holdFill: boolean, className: string | undefined): string =>
  [
    'touch-manipulation select-none',
    holdFill ? 'relative overflow-hidden' : '',
    className,
  ]
    .filter((part) => part && part.length > 0)
    .join(' ');

/**
 * Shared press surface. Owns the gesture hook, optional title popup, and
 * touch classes. Callers pass onFire when Sofie should receive the tap.
 */
export const Pressable = ({
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  as = 'button',
  children,
  className,
  disabled = false,
  holdFill = false,
  mode = 'tap',
  onFire = () => undefined,
  tooltip,
}: PressableProps) => {
  const holdHint = useHoldHint();
  const press = useButtonPress({
    disabled,
    mode,
    onFire,
    onHoldHint: holdHint.show,
  });
  const content =
    typeof children === 'function'
      ? children({ holdHint: holdHint.text })
      : children;
  const announced = holdHint.text
    ? [tooltip?.title ?? ariaLabel, holdHint.text]
        .filter((part): part is string => Boolean(part))
        .join(', ')
    : ariaLabel;
  const mergedClass = touchClass(holdFill, className);
  const body = (
    <>
      {holdFill ? <HoldFill pressing={press.pressing} /> : null}
      {content}
    </>
  );
  const popup =
    press.titleRect && tooltip ? (
      <TitlePopup
        credit={tooltip.credit}
        rect={press.titleRect}
        subtitle={tooltip.subtitle}
        title={tooltip.title}
      />
    ) : null;

  if (as === 'div') {
    return (
      <>
        <div className={mergedClass} {...press.handlers}>
          {body}
        </div>
        {popup}
      </>
    );
  }

  return (
    <>
      <button
        aria-current={ariaCurrent}
        aria-label={announced}
        aria-pressed={ariaPressed}
        className={mergedClass}
        disabled={disabled}
        type="button"
        {...press.handlers}
      >
        {body}
      </button>
      {popup}
    </>
  );
};

/** Compact labeled chip. Taps are inert until the caller passes onFire. */
export const Chip = ({
  disabled,
  label,
  onFire,
  pressed,
}: {
  disabled?: boolean;
  label: string;
  onFire?: () => void;
  pressed?: boolean;
}) => (
  <Pressable
    aria-pressed={pressed}
    className={`min-h-12 border px-2 font-mono text-[11px] uppercase tracking-[0.12em] ${
      disabled
        ? 'border-line text-muted'
        : 'border-line text-ink active:border-cue'
    } ${pressed ? 'border-cue text-cue' : ''}`}
    disabled={disabled}
    onFire={onFire}
  >
    {label}
  </Pressable>
);
