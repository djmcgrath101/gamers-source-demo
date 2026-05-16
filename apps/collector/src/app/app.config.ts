import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAppConfig, provideLogger } from '@gamers-source/shared-angular-core';
import { provideMaterial } from '@gamers-source/shared-material-core';
import { appRoutes } from './app.routes';

const appCode = 'GSC';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideRouter(appRoutes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),

    /**
     * Lib providers
     */
    provideAppConfig({
      name: "Gamer's Source Collector",
      code: appCode,
      theme: { active: 'system', themes: ['light', 'dark'] }
    }),
    provideLogger(appCode),
    provideMaterial()
  ]
};
