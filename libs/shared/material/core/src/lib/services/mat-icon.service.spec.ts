import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconDefinition as FaIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { MatSvgIconDefinition, SvgIconDefinition } from '@gamers-source/shared-material-types';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import { MatIconService } from './mat-icon.service';

describe('MatIconService', () => {
  let spectator: SpectatorService<MatIconService>;
  let domSanitizerMock: Pick<
    DomSanitizer,
    'bypassSecurityTrustHtml' | 'bypassSecurityTrustResourceUrl'
  >;
  let matIconRegistryMock: Pick<
    MatIconRegistry,
    'addSvgIconInNamespace' | 'addSvgIconLiteralInNamespace' | 'setDefaultFontSetClass'
  >;

  const safeHtml = '<safe-svg>' as unknown as SafeHtml;
  const safeResourceUrl = '/safe/icons/test.svg' as unknown as SafeResourceUrl;

  function getSymbolsLink(): HTMLLinkElement | null {
    return document.head.querySelector<HTMLLinkElement>('link[href*="Material+Symbols"]');
  }

  function removeSymbolsLinks(): void {
    for (const linkTag of Array.from(
      document.head.querySelectorAll('link[href*="Material+Symbols"]')
    )) {
      linkTag.remove();
    }
  }

  const createService = createServiceFactory({
    service: MatIconService,
    providers: [
      {
        provide: DomSanitizer,
        useFactory: () => domSanitizerMock
      },
      {
        provide: MatIconRegistry,
        useFactory: () => matIconRegistryMock
      }
    ]
  });

  beforeEach(() => {
    removeSymbolsLinks();

    domSanitizerMock = {
      bypassSecurityTrustHtml: vitest.fn(() => safeHtml),
      bypassSecurityTrustResourceUrl: vitest.fn(() => safeResourceUrl)
    };
    matIconRegistryMock = {
      addSvgIconInNamespace: vitest.fn(),
      addSvgIconLiteralInNamespace: vitest.fn(),
      setDefaultFontSetClass: vitest.fn()
    };

    spectator = createService();
  });

  afterEach(() => {
    removeSymbolsLinks();
  });

  it('creates instance', () => {
    expect(spectator.service).toBeTruthy();
  });

  describe('register', () => {
    it('registers a FontAwesome icon as a sanitized SVG literal', () => {
      const iconDefinition: FaIconDefinition = {
        icon: [24, 16, [], 'f179', 'M0 0h24v16H0z'],
        iconName: 'apple',
        prefix: 'fab'
      };

      spectator.service.register(iconDefinition);

      expect(domSanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16"><path d="M0 0h24v16H0z" /></svg>'
      );
      expect(matIconRegistryMock.addSvgIconLiteralInNamespace).toHaveBeenCalledWith(
        'fab',
        'apple',
        safeHtml
      );
    });
    it('registers an SVG icon path as a sanitized resource URL', () => {
      const iconDefinition: SvgIconDefinition = {
        iconName: 'brand-mark',
        path: '/assets/icons/brand-mark.svg',
        prefix: 'app'
      };

      spectator.service.register(iconDefinition);

      expect(domSanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        '/assets/icons/brand-mark.svg'
      );
      expect(matIconRegistryMock.addSvgIconInNamespace).toHaveBeenCalledWith(
        'app',
        'brand-mark',
        safeResourceUrl
      );
    });
    it('registers FontAwesome and custom SVG definitions with the correct registry methods', () => {
      const faIconDefinition: FaIconDefinition = {
        icon: [16, 16, [], 'f09a', 'M1 1h14v14H1z'],
        iconName: 'facebook',
        prefix: 'fab'
      };
      const svgIconDefinition: SvgIconDefinition = {
        iconName: 'custom-test',
        path: '/assets/icons/custom-test.svg',
        prefix: 'app'
      };
      const iconDefinitions: readonly MatSvgIconDefinition[] = [
        faIconDefinition,
        svgIconDefinition
      ];

      spectator.service.register(...iconDefinitions);

      expect(matIconRegistryMock.addSvgIconLiteralInNamespace).toHaveBeenCalledWith(
        'fab',
        'facebook',
        safeHtml
      );
      expect(matIconRegistryMock.addSvgIconInNamespace).toHaveBeenCalledWith(
        'app',
        'custom-test',
        safeResourceUrl
      );
    });

    it('adds Material Symbol names to the Google Fonts URL', () => {
      spectator.service.register('home', 'settings');

      const linkTag = getSymbolsLink();
      const url = new URL(linkTag?.href ?? '');

      expect(linkTag).toBeTruthy();
      expect(url.searchParams.get('icon_names')).toBe('home,settings');
      expect(url.searchParams.get('family')).toBe(
        'Material Symbols Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200'
      );
      expect(linkTag?.href).not.toContain('Material%2BSymbols');
    });

    it('deduplicates Material Symbol names across registrations', () => {
      spectator.service.register('home', 'settings');
      spectator.service.register('home', 'search');

      const linkTag = getSymbolsLink();
      const url = new URL(linkTag?.href ?? '');

      expect(url.searchParams.get('icon_names')).toBe('home,settings,search');
    });

    it('does not create a Material Symbols link when only SVG icons are registered', () => {
      const iconDefinition: SvgIconDefinition = {
        iconName: 'brand-mark',
        path: '/assets/icons/brand-mark.svg',
        prefix: 'app'
      };

      spectator.service.register(iconDefinition);

      expect(getSymbolsLink()).toBeNull();
    });
  });

  describe('setSymbolsStyle', () => {
    it('sets the Material Symbols font set class for the requested style', () => {
      spectator.service.setSymbolsStyle('rounded');

      expect(matIconRegistryMock.setDefaultFontSetClass).toHaveBeenCalledWith(
        'material-symbols-rounded'
      );
    });

    it('does not create a Material Symbols link until symbol names are registered', () => {
      spectator.service.setSymbolsStyle('rounded');

      expect(getSymbolsLink()).toBeNull();
    });

    it('updates the Google Fonts family parameter after symbol names are registered', () => {
      spectator.service.register('home');
      spectator.service.setSymbolsStyle('rounded');

      const linkTag = getSymbolsLink();
      const url = new URL(linkTag?.href ?? '');

      expect(linkTag).toBeTruthy();
      expect(url.searchParams.get('family')).toBe(
        'Material Symbols Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200'
      );
      expect(url.searchParams.get('icon_names')).toBe('home');
      expect(linkTag?.href).not.toContain('Material%2BSymbols');
    });
  });
});
