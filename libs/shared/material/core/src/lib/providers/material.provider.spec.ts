import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconService } from '../services/mat-icon.service';
import { withIcons, withSymbolsStyle } from './material-features.providers';
import { provideMaterial } from './material.provider';

describe('provideMaterial', () => {
  let matIconServiceMock: Pick<MatIconService, 'register' | 'setSymbolsStyle'>;
  let matIconRegistryMock: Pick<MatIconRegistry, 'setDefaultFontSetClass'>;

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

  beforeEach(() => {
    removeSymbolsLinks();

    matIconServiceMock = {
      register: vitest.fn(),
      setSymbolsStyle: vitest.fn()
    };
    matIconRegistryMock = {
      setDefaultFontSetClass: vitest.fn()
    };
  });

  afterEach(() => {
    removeSymbolsLinks();
    TestBed.resetTestingModule();
  });

  it('registers SVG icons and symbols style during app initialization', () => {
    const iconDefinition = {
      iconName: 'brand-mark',
      path: '/assets/icons/brand-mark.svg',
      prefix: 'app'
    };

    TestBed.configureTestingModule({
      providers: [
        provideMaterial(withIcons(iconDefinition), withSymbolsStyle('sharp')),
        {
          provide: MatIconService,
          useValue: matIconServiceMock
        }
      ]
    });

    TestBed.inject(MatIconService);

    expect(matIconServiceMock.register).toHaveBeenCalledWith(iconDefinition);
    expect(matIconServiceMock.setSymbolsStyle).toHaveBeenCalledWith('sharp');
  });

  it('adds the Material Symbols link tag during server app initialization', () => {
    TestBed.configureTestingModule({
      providers: [
        provideMaterial(withIcons('home', 'settings'), withSymbolsStyle('sharp')),
        {
          provide: PLATFORM_ID,
          useValue: 'server'
        },
        {
          provide: DomSanitizer,
          useValue: {}
        },
        {
          provide: MatIconRegistry,
          useValue: matIconRegistryMock
        }
      ]
    });

    TestBed.inject(MatIconService);

    const linkTag = getSymbolsLink();
    const url = new URL(linkTag?.href ?? '');

    expect(linkTag).toBeTruthy();
    expect(linkTag?.rel).toBe('stylesheet');
    expect(url.searchParams.get('family')).toBe(
      'Material Symbols Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200'
    );
    expect(url.searchParams.get('icon_names')).toBe('home,settings');
    expect(matIconRegistryMock.setDefaultFontSetClass).toHaveBeenCalledWith(
      'material-symbols-sharp'
    );
  });
});
