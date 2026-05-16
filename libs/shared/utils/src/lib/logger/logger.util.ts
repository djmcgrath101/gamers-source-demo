import { kebabCase } from 'lodash-es';
import { LogTransport } from './logger-transport.utils';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Array of all supported log levels.
 */
export const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

/**
 * Separator used between namespace segments.
 */
export const LOG_NAMESPACE_SEPARATOR = ':';

/**
 * Logger class that provides methods for logging messages at different levels (debug, info, warn, error).
 * It uses an array of LogTransport instances to handle the actual logging logic.
 */
export class Logger {
  constructor(
    readonly namespace: string,
    readonly transports: readonly LogTransport[],
    readonly levels = LOG_LEVELS
  ) {
    transports.forEach(transport => {
      transport.initialize(namespace, levels);
    });
  }

  /**
   * Emits a debug level log message.
   */
  debug(...args: unknown[]): void {
    this.emit('debug', ...args);
  }

  /**
   * Instructs each transport to log a message at the specified level.
   * @param level The log level.
   * @param args The arguments to log.
   */
  protected emit(level: LogLevel, ...args: unknown[]) {
    this.transports.forEach(transport => transport.log(this.namespace, level, ...args));
  }

  /**
   * Emits an error level log message.
   */
  error(...args: unknown[]): void {
    this.emit('error', ...args);
  }

  /**
   * Creates a new Logger instance with an extended namespace.
   * @param suffix The suffix to append to the current namespace.
   * @returns A new Logger instance with the extended namespace.
   */
  extendScope(suffix: string): Logger {
    const scope = kebabCase(suffix);
    return new Logger([this.namespace, scope].join(LOG_NAMESPACE_SEPARATOR), this.transports);
  }

  /**
   * Emits an info level log message.
   */
  info(...args: unknown[]): void {
    this.emit('info', ...args);
  }

  /**
   * Emits a warn level log message.
   */
  warn(...args: unknown[]): void {
    this.emit('warn', ...args);
  }
}
