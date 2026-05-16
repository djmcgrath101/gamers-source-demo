import { EnvironmentProviders, Provider } from '@angular/core';

/**
 * Determines if a collection of providers contains a mix of multi and non-multi providers.
 */
export function isMixedMultiProviders(...providers: (EnvironmentProviders | Provider)[]): boolean {
  let isMixed = false;

  if (providers.some(p => 'multi' in p && p.multi)) {
    isMixed = providers.some(p => !('multi' in p && p.multi));
  }

  return isMixed;
}
