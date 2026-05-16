import { debug, Debugger } from 'debug';
import { LOG_NAMESPACE_SEPARATOR, LogLevel } from './logger.util';

export interface LogTransport {
  /**
   * Enable all logging for this transport.
   */
  enableAll(): void;
  /**
   * Initializes the transport by creating, but without enabling,
   * logger instances for the given namespace and levels.
   */
  initialize(namespace: string, levels: readonly LogLevel[]): void;
  /**
   * Check if logging is enabled for the given namespace and level.
   */
  isEnabled(namespace: string, level: LogLevel): boolean;
  /**
   * Log a message for the given namespace at the specified level.
   */
  log: (namespace: string, level: LogLevel, ...args: unknown[]) => void;
}

/**
 * A log transport that can be used to log messages to the console.
 * It uses the `debug` library to create loggers for each namespace and log level.
 */
export class ConsoleTransport implements LogTransport {
  protected readonly loggers = new Map<string, Debugger>();

  protected allEnabled = false;

  protected createLogger(namespace: string, level: LogLevel): Debugger {
    const fullNamespace = this.fullNamespace(namespace, level);
    const logger = debug(fullNamespace);

    if (this.allEnabled) {
      logger.enabled = true;
    }

    this.loggers.set(fullNamespace, logger);

    return logger;
  }

  enableAll(): void {
    this.allEnabled = true;
    this.loggers.forEach(logger => {
      logger.enabled = true;
    });
  }

  protected fullNamespace(namespace: string, level: LogLevel): string {
    return `${namespace}${LOG_NAMESPACE_SEPARATOR}${level}`;
  }

  initialize(namespace: string, levels: readonly LogLevel[]): void {
    levels.forEach(level => {
      const logger = this.createLogger(namespace, level);
      // Bind the logger to the corresponding console method.
      // This allows us to filter the logs in the browser console
      // by their log level.
      logger.log = console[level].bind(console);
    });
  }

  protected getLogger(namespace: string, level: LogLevel): Debugger {
    const fullNamespace = this.fullNamespace(namespace, level);
    const logger = this.loggers.get(fullNamespace) || this.createLogger(namespace, level);

    return logger;
  }

  isEnabled(namespace: string, level: LogLevel): boolean {
    const logger = this.getLogger(namespace, level);
    return logger.enabled;
  }

  log(namespace: string, level: LogLevel, ...args: unknown[]): void {
    const logger = this.getLogger(namespace, level);
    const [formatter, ...restArgs] = args;

    logger(formatter, ...restArgs);
  }
}

export class NoopTransport implements LogTransport {
  enableAll(): void {
    // No-op
  }
  initialize(): void {
    // No-op
  }
  isEnabled(): boolean {
    return false;
  }
  log(): void {
    // No-op
  }
}
