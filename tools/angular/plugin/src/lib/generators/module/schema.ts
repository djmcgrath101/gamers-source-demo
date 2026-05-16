import { Schema as AngularModuleSchema } from '@schematics/angular/module/schema';
import { SetRequired } from 'type-fest';

export interface NgModuleGeneratorCustomOpts {
  readonly core?: boolean;
  readonly forRoot?: boolean;
  readonly skipFormat?: boolean;
  readonly skipSpec?: boolean;
  readonly ui?: boolean;
}

export type NgModuleGeneratorOptions = AngularModuleSchema & NgModuleGeneratorCustomOpts;

export type NormalizedNgModuleGeneratorOptions = SetRequired<
  NgModuleGeneratorOptions,
  keyof NgModuleGeneratorCustomOpts
>;
