import { LogTransport } from './logger-transport.utils';
import { LOG_LEVELS, Logger } from './logger.util';

class MockTransport implements LogTransport {
  initialize = vitest.fn();
  isEnabled = vitest.fn();
  log = vitest.fn();
  enableAll = vitest.fn();
}

describe('Logger', () => {
  let logger: Logger;
  let transport: MockTransport;

  const namespace = 'test-namespace';

  beforeEach(() => {
    transport = new MockTransport();
    logger = new Logger(namespace, [transport]);
  });

  it('creates an instance', () => {
    expect(logger).toBeTruthy();
  });

  it('initializes transports on creation using default log levels', () => {
    expect(transport.initialize).toHaveBeenCalledWith(namespace, LOG_LEVELS);
  });

  it('emits debug logs', () => {
    const message = 'Debug message';
    logger.debug(message);
    expect(transport.log).toHaveBeenCalledWith(namespace, 'debug', message);
  });

  it('emits info logs', () => {
    const message = 'Info message';
    logger.info(message);
    expect(transport.log).toHaveBeenCalledWith(namespace, 'info', message);
  });

  it('emits warn logs', () => {
    const message = 'Warn message';
    logger.warn(message);
    expect(transport.log).toHaveBeenCalledWith(namespace, 'warn', message);
  });

  it('emits error logs', () => {
    const message = 'Error message';
    logger.error(message);
    expect(transport.log).toHaveBeenCalledWith(namespace, 'error', message);
  });

  it('extends scope correctly', () => {
    const extendedLogger = logger.extendScope('New Scope');
    expect(extendedLogger.namespace).toBe('test-namespace:new-scope');
  });
});
