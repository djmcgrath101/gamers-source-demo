import { DOCUMENT, Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconDefinition as FaIconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  MatSvgIconDefinition,
  MatSymbolName,
  MatSymbolStyle,
  SvgIconDefinition
} from '@gamers-source/shared-material-types';
import { capitalize, isString, partition } from 'lodash-es';

export interface MatSymbolsFontParams {
  fill?: string;
  grade?: string;
  opticalSize?: string;
  style?: MatSymbolStyle;
  weight?: string;
}

export const DEFAULT_MAT_SYMBOLS_FONT_PARAMS: Required<MatSymbolsFontParams> = {
  fill: '0..1',
  grade: '-25..200',
  opticalSize: '20..48',
  style: 'outlined',
  weight: '100..700'
};

@Injectable({ providedIn: 'root' })
export class MatIconService {
  readonly #document = inject(DOCUMENT);
  readonly #domSanitizer = inject(DomSanitizer);
  readonly #matIconRegistry = inject(MatIconRegistry);
  readonly #symbolNames = new Set<MatSymbolName>();
  #symbolsStyle: MatSymbolStyle = DEFAULT_MAT_SYMBOLS_FONT_PARAMS.style;

  /**
   * Returns the Material Symbols link tag, creating and appending
   * it to the document head if it doesn't already exist.
   */
  get #linkTag(): HTMLLinkElement {
    let tag = this.#document.head.querySelector<HTMLLinkElement>('link[href*="Material+Symbols"]');

    if (!tag) {
      tag = this.#document.createElement('link');
      tag.rel = 'stylesheet';

      this.#document.head.appendChild(tag);
    }

    return tag;
  }

  /**
   * Generates the family query param portion for the Material Symbols link tag href
   * using the provided params.  Any missing params are filled in with defaults.
   */
  private createFamilyParam(params: MatSymbolsFontParams = {}): string {
    const { fill, grade, opticalSize, style, weight } = {
      ...DEFAULT_MAT_SYMBOLS_FONT_PARAMS,
      ...params
    };

    let family = `Material Symbols ${capitalize(style)}:opsz,wght,FILL,GRAD@`;
    family += `${opticalSize},${weight},${fill},${grade}`;

    return family;
  }

  /**
   * Registers the set of provided icons by either adding the symbol names
   * to the Material Symbols link tag or by registering the SVG icons with
   * the MatIconRegistry.
   */
  register(...icons: ReadonlyArray<MatSymbolName | MatSvgIconDefinition>): void {
    const [symbols, svgs] = partition(icons, isString);

    this.registerSymbols(...symbols);
    this.registerSvgIcons(...svgs);
  }

  private registerFaIcon(def: FaIconDefinition): void {
    const { prefix, iconName } = def;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${def.icon[0]} ${def.icon[1]}"><path d="${def.icon[4]}" /></svg>`;

    this.#matIconRegistry.addSvgIconLiteralInNamespace(
      prefix,
      iconName,
      this.#domSanitizer.bypassSecurityTrustHtml(svg)
    );
  }

  private registerSvgIcon(def: SvgIconDefinition): void {
    const { prefix, iconName, path } = def;

    this.#matIconRegistry.addSvgIconInNamespace(
      prefix,
      iconName,
      this.#domSanitizer.bypassSecurityTrustResourceUrl(path)
    );
  }

  private registerSvgIcons(...icons: readonly MatSvgIconDefinition[]): void {
    for (const icon of icons) {
      if ('icon' in icon) {
        this.registerFaIcon(icon);
      } else {
        this.registerSvgIcon(icon);
      }
    }
  }

  private registerSymbols(...symbolNames: readonly MatSymbolName[]): void {
    if (!symbolNames.length) return;

    for (const symbolName of symbolNames) {
      this.#symbolNames.add(symbolName);
    }

    this.updateSymbolsLink();
  }

  setSymbolsStyle(style: MatSymbolStyle): void {
    this.#symbolsStyle = style;
    this.#matIconRegistry.setDefaultFontSetClass(`material-symbols-${style}`);

    if (this.#symbolNames.size) {
      this.updateSymbolsLink();
    }
  }

  private updateSymbolsLink(): void {
    const url = new URL('https://fonts.googleapis.com/css2');
    url.searchParams.set('family', this.createFamilyParam({ style: this.#symbolsStyle }));
    url.searchParams.set('display', 'block');
    url.searchParams.set('icon_names', [...this.#symbolNames].join(','));

    this.#linkTag.href = url.toString();
  }
}
