import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

/** Destructive controls arm only after the finger stays down this long. */
export const HOLD_MS = 600;
const TITLE_PRESS_MS = 500;
const MOVE_CANCEL_PX = 12;

type PressMode = 'hold' | 'preview' | 'tap';

type Gesture = {
  consumed: boolean;
  holdTimer?: number;
  moved: boolean;
  previewTimer?: number;
  x: number;
  y: number;
};

const clearGestureTimers = (gesture: Gesture) => {
  if (gesture.previewTimer !== undefined) {
    window.clearTimeout(gesture.previewTimer);
  }
  if (gesture.holdTimer !== undefined) {
    window.clearTimeout(gesture.holdTimer);
  }
};

/**
 * Tap fires on release. A long press shows the full title and does not fire.
 * Hold fires only after HOLD_MS. A short release asks the caller to show "Hold".
 * Movement cancels the gesture so a scroll is not a tap.
 */
export const useButtonPress = (options: {
  disabled: boolean;
  mode: PressMode;
  onFire: () => void;
  onHoldHint: () => void;
}) => {
  // The hold timer outlives the render that started it. Read the latest
  // callbacks from this ref so a stale onFire cannot run.
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const gesture = useRef<Gesture | null>(null);
  const [pressing, setPressing] = useState(false);
  const [titleRect, setTitleRect] = useState<DOMRect | null>(null);

  useEffect(
    () => () => {
      const active = gesture.current;
      if (active) {
        clearGestureTimers(active);
      }
    },
    []
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (optionsRef.current.disabled) {
      return;
    }
    if (gesture.current) {
      return;
    }
    const element = event.currentTarget;
    const next: Gesture = {
      consumed: false,
      moved: false,
      x: event.clientX,
      y: event.clientY,
    };
    if (optionsRef.current.mode !== 'hold') {
      next.previewTimer = window.setTimeout(() => {
        const active = gesture.current;
        if (!active || active.moved || active.consumed) {
          return;
        }
        // A long press is for the title popup. Mark it consumed so release
        // does not also count as a tap.
        if (optionsRef.current.mode === 'tap') {
          active.consumed = true;
        }
        setTitleRect(element.getBoundingClientRect());
      }, TITLE_PRESS_MS);
    }
    if (optionsRef.current.mode === 'hold') {
      setPressing(true);
      next.holdTimer = window.setTimeout(() => {
        const active = gesture.current;
        if (!active || active.moved || active.consumed) {
          return;
        }
        active.consumed = true;
        optionsRef.current.onFire();
      }, HOLD_MS);
    }
    gesture.current = next;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const active = gesture.current;
    if (!active || active.moved) {
      return;
    }
    const distance = Math.hypot(
      event.clientX - active.x,
      event.clientY - active.y
    );
    if (distance < MOVE_CANCEL_PX) {
      return;
    }
    active.moved = true;
    clearGestureTimers(active);
    setPressing(false);
    setTitleRect(null);
  };

  const finish = () => {
    const active = gesture.current;
    gesture.current = null;
    if (!active) {
      return;
    }
    clearGestureTimers(active);
    setPressing(false);
    setTitleRect(null);
    if (active.moved || active.consumed) {
      return;
    }
    if (optionsRef.current.mode === 'hold') {
      optionsRef.current.onHoldHint();
      return;
    }
    if (optionsRef.current.mode === 'tap') {
      optionsRef.current.onFire();
    }
  };

  return {
    handlers: {
      onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
        event.preventDefault();
      },
      onPointerCancel: finish,
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
    },
    pressing,
    titleRect,
  };
};
