/**
 * Simple logger class for FormAutoPopulationService with enable/disable functionality
 */
export class Logger {
  private prefix: string;
  private enabled: boolean;

  /**
   * Create a new logger instance
   * @param prefix The prefix to use for all log messages
   * @param enabled Whether logging is enabled by default
   */
  constructor(prefix = '', enabled = false) {
    this.prefix = prefix;
    this.enabled = enabled;
  }

  /**
   * Log a debug message if logging is enabled
   */
  debug(...args: any[]): void {
    if (this.enabled) {
      console.log(this.prefix, ...args);
    }
  }

  /**
   * Log an error message (always shown regardless of enabled state)
   */
  error(...args: any[]): void {
    console.error(this.prefix, ...args);
  }

  /**
   * Log a warning message (always shown regardless of enabled state)
   */
  warn(...args: any[]): void {
    console.warn(this.prefix, ...args);
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable logging
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
