import { Mock } from 'vitest';
import { ConsoleTransport } from './logger-transport.utils';
import { LOG_LEVELS } from './logger.util';

type MockDebugger = Mock & {
  enabled: boolean;
  log: Mock;
};

const debugInstances = new Map<string, MockDebugger>();

vitest.mock('debug', () => ({
  debug: vitest.fn()
}));

const registerDebugger = (namespace: string): MockDebugger => {
  const logger: MockDebugger = Object.assign(vitest.fn(), {
    enabled: false,
    log: vitest.fn()
  });

  debugInstances.set(namespace, logger);

  return logger;
};

describe('logger-transport.utils', () => {
  describe('ConsoleTransport', () => {
    let transport: ConsoleTransport;

    const namespace = 'test-namespace';

    beforeEach(async () => {
      transport = new ConsoleTransport();
      debugInstances.clear();
      const { debug: debugMock } = await vitest.importMock<{ debug: Mock }>('debug');
      debugMock.mockReset();
      debugMock.mockImplementation(namespaceArg => registerDebugger(namespaceArg));
    });

    it('creates instance', () => {
      expect(transport).toBeTruthy();
    });

    it('initializes loggers for each level and binds console methods', () => {
      const consoleSpies = LOG_LEVELS.map(level =>
        vitest.spyOn(console, level).mockImplementation(() => undefined)
      );

      transport.initialize(namespace, LOG_LEVELS);

      LOG_LEVELS.forEach((level, index) => {
        const logger = debugInstances.get(`${namespace}:${level}`);

        expect(logger).toBeDefined();

        logger?.log('message');
        expect(consoleSpies[index]).toHaveBeenCalledWith('message');
      });

      consoleSpies.forEach(spy => spy.mockRestore());
    });

    it('logs through debug instances', () => {
      transport.initialize(namespace, LOG_LEVELS);

      const debugLogger = debugInstances.get(`${namespace}:debug`);

      expect(debugLogger).toBeDefined();

      transport.log(namespace, 'debug', 'format', 'arg');

      expect(debugLogger as MockDebugger).toHaveBeenCalledWith('format', 'arg');
    });

    it('reports enabled state for namespaces', () => {
      transport.initialize(namespace, LOG_LEVELS);

      expect(transport.isEnabled(namespace, 'info')).toBe(false);

      transport.enableAll();

      expect(transport.isEnabled(namespace, 'info')).toBe(true);
    });

    it('enables existing and future loggers after enableAll', () => {
      transport.initialize(namespace, LOG_LEVELS);

      transport.enableAll();

      LOG_LEVELS.forEach(level => {
        const logger = debugInstances.get(`${namespace}:${level}`);
        expect(logger?.enabled).toBe(true);
      });

      const otherNamespace = 'other-namespace';
      transport.initialize(otherNamespace, LOG_LEVELS);

      LOG_LEVELS.forEach(level => {
        const logger = debugInstances.get(`${otherNamespace}:${level}`);
        expect(logger?.enabled).toBe(true);
      });
    });

    it('enables loggers created lazily after enableAll', () => {
      transport.enableAll();

      transport.log(namespace, 'warn', 'message');

      const logger = debugInstances.get(`${namespace}:warn`);
      expect(logger?.enabled).toBe(true);
    });
  });
});
