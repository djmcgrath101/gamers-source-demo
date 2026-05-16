import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '@gamers-source/shared-angular-data-access';
import { createMockAppConfig } from '@gamers-source/shared-angular-testing';
import { provideAppConfig } from './app-config.provider';

describe('provideAppConfig', () => {
  it('provides the expected app config', () => {
    const appConfig = createMockAppConfig();
    TestBed.configureTestingModule({ providers: [provideAppConfig(appConfig)] });

    const config = TestBed.inject(APP_CONFIG);
    expect(config).toEqual(appConfig);
  });
});
