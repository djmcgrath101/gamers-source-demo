import { signalStore } from '@ngrx/signals';
import {
  AsyncRequestStatus,
  initialAsyncRequestState,
  withAsyncRequest
} from './async-request.feature';

const TestStore = signalStore({ providedIn: 'root' }, withAsyncRequest());

type TestStoreInstance = InstanceType<typeof TestStore>;

describe('withAsyncRequest()', () => {
  const createStore = (): TestStoreInstance => new TestStore();

  it('provides the initial idle status and derived selectors', () => {
    const store = createStore();

    expect(store.status()).toBe(initialAsyncRequestState.status);
    expect(store.isIdle()).toBe(true);
    expect(store.isPending()).toBe(false);
    expect(store.isFulfilled()).toBe(false);
    expect(store.isError()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('updates status flags via setStatus for pending and fulfilled states', () => {
    const store = createStore();

    store.setStatus('pending');
    expect(store.status()).toBe('pending');
    expect(store.isIdle()).toBe(false);
    expect(store.isPending()).toBe(true);
    expect(store.isFulfilled()).toBe(false);
    expect(store.isError()).toBe(false);

    store.setStatus('fulfilled');
    expect(store.status()).toBe('fulfilled');
    expect(store.isPending()).toBe(false);
    expect(store.isFulfilled()).toBe(true);
    expect(store.isError()).toBe(false);
  });

  it('captures errors when status is set to an error object', () => {
    const store = createStore();
    const errorStatus: AsyncRequestStatus = { error: 'Something went wrong' };

    store.setStatus(errorStatus);
    expect(store.status()).toEqual(errorStatus);
    expect(store.isError()).toBe(true);
    expect(store.isIdle()).toBe(false);
    expect(store.isPending()).toBe(false);
    expect(store.isFulfilled()).toBe(false);
    expect(store.error()).toBe('Something went wrong');
  });

  it('resets back to the initial idle status', () => {
    const store = createStore();

    store.setStatus('pending');
    store.reset();

    expect(store.status()).toBe(initialAsyncRequestState.status);
    expect(store.isIdle()).toBe(true);
    expect(store.isPending()).toBe(false);
    expect(store.isFulfilled()).toBe(false);
    expect(store.isError()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
