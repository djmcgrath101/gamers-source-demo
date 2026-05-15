export interface MediaBreakpoints {
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly ['2xl']: number;
}

export type MediaBreakpoint = keyof MediaBreakpoints;

export type ScreenOrientation = 'portrait' | 'landscape';
