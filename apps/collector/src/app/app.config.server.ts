import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { providePlatformUserAgent } from '@gamers-source/shared-angular-core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes)), providePlatformUserAgent()]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
