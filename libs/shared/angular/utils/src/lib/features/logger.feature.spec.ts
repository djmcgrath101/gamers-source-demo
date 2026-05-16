import { TestBed } from '@angular/core/testing';
import { Logger } from '@gamers-source/shared-utils';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Mocked, MockedFunction } from 'vitest';
import { withLogger } from './logger.feature';

interface TestState {
  count: number;
}

const initialTestState: TestState = { count: 0 };

const TestStore = signalStore(
  { providedIn: 'root' },
  withLogger('TestStore'),
  withState(initialTestState),
  withMethods(store => ({
    setCount(count: number) {
      patchState(store, () => ({ count }));
    }
  }))
);

type TestStoreInstance = InstanceType<typeof TestStore>;

interface LoggerMock {
  logger: Mocked<Logger>;
  scopedLogger: Mocked<Logger>;
}

const createLoggerMock = (): LoggerMock => {
  const scopedLogger = {
    debug: vitest.fn(),
    error: vitest.fn(),
    extendScope: vitest.fn(),
    info: vitest.fn(),
    warn: vitest.fn()
  } as unknown as Mocked<Logger>;

  (scopedLogger.extendScope as MockedFunction<Logger['extendScope']>).mockReturnValue(scopedLogger);

  const logger = {
    debug: vitest.fn(),
    error: vitest.fn(),
    extendScope: vitest.fn(),
    info: vitest.fn(),
    warn: vitest.fn()
  } as unknown as Mocked<Logger>;

  (logger.extendScope as MockedFunction<Logger['extendScope']>).mockReturnValue(scopedLogger);

  return { logger, scopedLogger };
};

const configureTestingModule = (providers: unknown[] = []) =>
  TestBed.configureTestingModule({
    providers: [TestStore, ...providers]
  });

const createStore = (): TestStoreInstance => TestBed.inject(TestStore);

describe('withLogger', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('logs state changes with the provided logger scope', () => {
    const { logger, scopedLogger } = createLoggerMock();

    configureTestingModule([{ provide: Logger, useValue: logger }]);

    const store = createStore();

    expect(scopedLogger.debug).toHaveBeenCalledWith('[watchState]', { count: 0 });

    scopedLogger.debug.mockClear();

    store.setCount(1);

    expect(store.count()).toBe(1);
    expect(scopedLogger.debug).toHaveBeenCalledWith('[watchState]', { count: 1 });

    store.setCount(2);

    expect(store.count()).toBe(2);
    expect(scopedLogger.debug).toHaveBeenCalledWith('[watchState]', { count: 2 });
  });
});
