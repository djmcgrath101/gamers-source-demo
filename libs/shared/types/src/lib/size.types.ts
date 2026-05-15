export interface Dimensions {
  readonly height: number;
  readonly width: number;
}

export type SizeUnit =
  | 'cm'
  | 'mm'
  | 'in'
  | 'px'
  | 'pt'
  | 'pc'
  | 'em'
  | 'ex'
  | 'ch'
  | 'rem'
  | 'vw'
  | 'vh'
  | 'vmin'
  | 'vmax'
  | '%';

/**
 * A size can be a number (which will be interpreted as pixels) or a string with a unit.
 */
export type Size = number | `${number}${SizeUnit}`;
