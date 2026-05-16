import { Route } from '@angular/router';
import { PageNotFoundView } from '@gamers-source/shared-angular-core';

export const appRoutes: Route[] = [
  // IMPORTANT: leave this route last
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundView
  }
];
