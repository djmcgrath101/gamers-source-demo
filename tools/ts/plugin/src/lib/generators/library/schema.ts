import {
  NormalizedNxProjectOptions,
  NxProjectOptions,
  NxProjectScope,
  NxProjectType
} from '@gamers-source/nx-types';
import { LibraryGeneratorSchema as NxTsLibSchema } from '@nx/js/src/generators/library/schema';
import { SetOptional, SetRequired } from 'type-fest';

export type NormalizedTsLibraryGeneratorOptions = NormalizedNxProjectOptions<
  TsLibraryProjectScope,
  TSLibraryProjectType
> &
  SetRequired<TsLibraryGeneratorOptions, 'checkDependencies' | 'unitTestRunner'>;

export type TsLibraryGeneratorOptions<T extends TSLibraryProjectType = TSLibraryProjectType> =
  SetOptional<NxTsLibSchema, 'directory'> &
    NxProjectOptions<TsLibraryProjectScope, T> & {
      /**
       * Enables the @nx/dependency-checks ESLint rule to ensure that the library
       * does not import dependencies that are not listed in its `package.json`.
       */
      checkDependencies?: boolean;
    };

export type TsLibraryProjectScope = NxProjectScope;
export type TSLibraryProjectType = Extract<NxProjectType, 'testing' | 'types' | 'utils'>;
