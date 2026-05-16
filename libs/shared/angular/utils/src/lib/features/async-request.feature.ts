import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';

export type AsyncRequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };

export interface AsyncRequestState {
  readonly status: AsyncRequestStatus;
}

export const initialAsyncRequestState: AsyncRequestState = {
  status: 'idle'
};

export function withAsyncRequest() {
  return signalStoreFeature(
    withState(initialAsyncRequestState),
    withComputed(({ status }) => ({
      error: () => {
        const statusState = status();
        return typeof statusState === 'object' && 'error' in statusState ? statusState.error : null;
      },
      isError: () => {
        const statusState = status();
        return typeof statusState === 'object' && 'error' in statusState ? true : false;
      },
      isIdle: () => status() === 'idle',
      isPending: () => status() === 'pending',
      isFulfilled: () => status() === 'fulfilled'
    })),
    withMethods(store => ({
      /**
       * Resets the async request state to its initial value
       */
      reset() {
        patchState(store, () => ({ ...initialAsyncRequestState }));
      },
      /**
       * Updates the async request status
       */
      setStatus(status: AsyncRequestStatus) {
        patchState(store, () => ({ status }));
      }
    }))
  );
}
