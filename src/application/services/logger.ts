// src/application/services/logger.ts
import pino from 'pino';

// This basic logger will output structured JSON to the browser console.
// It's configured to be very lightweight in production.
const logger = pino({
  level: import.meta.env.PROD ? 'info' : 'debug',
  browser: {
    asObject: true,
  },
});

// You can create "child" loggers to add context automatically to every log message.
// For example, a logger for all UI components.
export const uiLogger = logger.child({ context: 'UI' });
export const dbLogger = logger.child({ context: 'Database' });
export const authLogger = logger.child({ context: 'Auth' });
export const aiLogger = logger.child({ context: 'AI' });

export default logger;
