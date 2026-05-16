import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { APP_CONFIG } from '@gamers-source/shared-angular-data-access';
import { AppConfig } from '@gamers-source/shared-types';
import { normalizeAppConfig } from '@gamers-source/shared-utils';

export function provideAppConfig(config: AppConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_CONFIG,
      useFactory: () => normalizeAppConfig(config)
    }
  ]);
}
