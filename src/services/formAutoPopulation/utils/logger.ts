/**
 * Logger utility for the form auto population service
 */
export class Logger {
  private readonly prefix: string;
  private enabled: boolean;

  /**
   * Creates a logger instance
   * @param prefix The prefix to use for all logs
   * @param enabled Whether logging is enabled
   */
  constructor(prefix: string = '[FormAutoPopulation]', enabled: boolean = false) {
    this.prefix = prefix;
    this.enabled = enabled;
  }

  /**
   * Enables logging
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disables logging
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Logs an informational message
   */
  info(...args: any[]): void {
    if (this.enabled) {
      console.log(this.prefix, ...args);
    }
  }

  /**
   * Logs a debug message
   */
  debug(...args: any[]): void {
    if (this.enabled) {
      console.log(`${this.prefix} [DEBUG]`, ...args);
    }
  }

  /**
   * Logs a warning message
   */
  warn(...args: any[]): void {
    if (this.enabled) {
      console.warn(this.prefix, ...args);
    }
  }

  /**
   * Logs an error message
   */
  error(...args: any[]): void {
    if (this.enabled) {
      console.error(this.prefix, ...args);
    }
  }
}
