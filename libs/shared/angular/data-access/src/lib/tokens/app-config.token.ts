import { InjectionToken } from '@angular/core';
import { NormalizedAppConfig } from '@gamers-source/shared-types';

export const APP_CONFIG = new InjectionToken<NormalizedAppConfig>('APP_CONFIG');
