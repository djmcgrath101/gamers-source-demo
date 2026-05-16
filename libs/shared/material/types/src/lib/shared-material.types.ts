import { IconDefinition as FaIconDefinition } from '@fortawesome/fontawesome-svg-core';

export type MatIconType = 'icon' | 'symbol';

export type MatSymbolName = string & {};

export type MatSymbolStyle = 'outlined' | 'rounded' | 'sharp';

export type MatSvgIconDefinition = SvgIconDefinition | FaIconDefinition;

export interface SvgIconDefinition {
  readonly prefix: string;
  readonly iconName: string;
  readonly path: string;
}
