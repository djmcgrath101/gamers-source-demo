/* eslint-disable @typescript-eslint/no-explicit-any  */
/* eslint-disable @typescript-eslint/no-empty-object-type  */

export type AbstractConstructor<T = {}> = abstract new (...args: Array<any>) => T;
export type Constructor<T = {}> = new (...args: Array<any>) => T;
