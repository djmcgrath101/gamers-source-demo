import { TsLibraryGeneratorOptions } from '@gamers-source/ts-plugin';
import { Except } from 'type-fest';

export type NodeLibraryGeneratorOptions = Except<TsLibraryGeneratorOptions, 'scope'>;
