/**
 * Centralized logging utility for BookMyStars frontend.
 * Provides structured log levels: debug, info, warn, error.
 * Automatically suppresses verbose debug logs in production.
 */
const IS_PROD = import.meta.env.PROD;

export const logger = {
  debug: (...args) => {
    if (!IS_PROD) {
      console.debug("%c[DEBUG]", "color: #64748b; font-weight: bold;", ...args);
    }
  },
  info: (...args) => {
    console.info("%c[INFO]", "color: #0284c7; font-weight: bold;", ...args);
  },
  warn: (...args) => {
    console.warn("%c[WARN]", "color: #f59e0b; font-weight: bold;", ...args);
  },
  error: (...args) => {
    console.error("%c[ERROR]", "color: #ef4444; font-weight: bold;", ...args);
  }
};

export default logger;
