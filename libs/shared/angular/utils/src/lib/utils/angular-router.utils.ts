import { NavigationExtras } from '@angular/router';
import { convertUrlSearchParamsToRecord } from '@gamers-source/shared-utils';

export class NavigationRoute {
  constructor(
    readonly linkParams: Array<string>,
    readonly extras?: NavigationExtras
  ) {}

  static fromUrl(url: URL): NavigationRoute {
    const { hash, pathname, searchParams } = url;

    return new this([pathname], {
      fragment: hash.length ? hash : undefined,
      queryParams: convertUrlSearchParamsToRecord(searchParams)
    });
  }
}
