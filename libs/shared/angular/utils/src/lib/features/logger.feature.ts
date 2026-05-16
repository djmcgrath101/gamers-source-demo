import { signalStoreFeature, watchState, withHooks } from '@ngrx/signals';
import { injectLogger } from '../utils/angular-logger.utils';

/**
 * A feature to add logging capabilities to a signal store.
 * @param source The name of the store
 */
export function withLogger(source: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store, logger = injectLogger(source)) {
        if (logger) {
          watchState(store, state => {
            logger.debug('[watchState]', state);
          });
        }
      }
    })
  );
}
