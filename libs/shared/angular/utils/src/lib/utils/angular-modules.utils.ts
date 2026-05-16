import { NgModule } from '@angular/core';

/**
 * Module import guard that throws an error if the protected module has already been loaded.
 *
 * @param parentModule The module class to check if a module has already been loaded
 * @param moduleName The class name of the module
 *
 * @example
 *
 * ```ts
 * import { NgModule } from '@angular/core';
 * import { throwIfAlreadyLoaded } from '@gamers-source/shared-angular-utils';
 *
 * @NgModule({
 *  imports: [CoreModule],
 * })
 * export class CoreModule {
 *  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
 *    throwIfAlreadyLoaded(parentModule, 'CoreModule');
 *  }
 * }
 * ```
 *
 */
export function throwIfAlreadyLoaded(parentModule: NgModule, moduleName: string): void {
  if (parentModule) {
    throw new Error(
      `${moduleName} has already been loaded. Core modules can only be imported once.`
    );
  }
}
