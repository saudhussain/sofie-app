import pino from 'pino';

const LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
] as const;

type Level = (typeof LEVELS)[number];

const isLevel = (value: string): value is Level =>
  LEVELS.some((level) => level === value);

/**
 * Debug in development so frame drops and list updates are visible.
 * Info in a production build. `VITE_LOG_LEVEL` overrides either one.
 * Tests stay quiet unless that variable is set.
 */
const resolveLevel = (): Level => {
  const configured = import.meta.env.VITE_LOG_LEVEL;
  if (configured && isLevel(configured)) {
    return configured;
  }
  if (import.meta.env.MODE === 'test') {
    return 'silent';
  }
  return import.meta.env.DEV ? 'debug' : 'info';
};

/**
 * Browser build of Pino. One logger for the page; callers bind `module`.
 * `asObject` keeps the fields in one console record instead of loose arguments.
 */
export const logger = pino({
  browser: {
    asObject: true,
  },
  level: resolveLevel(),
});
