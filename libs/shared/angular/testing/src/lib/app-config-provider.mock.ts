import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { faker } from '@faker-js/faker';
import { APP_CONFIG } from '@gamers-source/shared-angular-data-access';
import { AppConfig, NormalizedAppConfig } from '@gamers-source/shared-types';
import { merge } from 'lodash-es';

export function createMockAppConfig(overrides: Partial<AppConfig> = {}): NormalizedAppConfig {
  return merge(
    {
      api: {
        baseUrl: faker.internet.url({ appendSlash: false, protocol: 'http' }),
        pathPrefix: '/api'
      },
      code: 'MOCK',
      name: 'Mock App'
    },
    overrides
  );
}

export function provideMockAppConfig(overrides: Partial<AppConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_CONFIG,
      useValue: createMockAppConfig(overrides)
    }
  ]);
}
