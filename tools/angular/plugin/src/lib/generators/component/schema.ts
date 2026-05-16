import { Schema as NxComponentSchema } from '@nx/angular/src/generators/component/schema';
import { SetOptional, SetRequired } from 'type-fest';

export interface NgComponentGeneratorOptions extends SetOptional<
  SetRequired<NxComponentSchema, 'name'>,
  'path'
> {
  readonly project: string;
}

export type NormalizedNgComponentOptions = SetRequired<NgComponentGeneratorOptions, 'path'>;
