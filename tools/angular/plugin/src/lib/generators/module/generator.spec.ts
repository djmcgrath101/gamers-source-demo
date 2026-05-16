import { joinPathFragments, Tree } from '@nx/devkit';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parseName } from '@schematics/angular/utility/parse-name';
import { Mock } from 'vitest';
import { ngModuleGenerator } from './generator';
import { NgModuleGeneratorOptions } from './schema';

vi.mock('@nx/devkit/ngcli-adapter', () => ({
  wrapAngularDevkitSchematic: vi.fn()
}));

describe('ngModuleGenerator', () => {
  let tree: Tree;
  const moduleGeneratorMock = vi.fn(async (host: Tree, options: NgModuleGeneratorOptions) => {
    const { name: parsedName, path: fullPath } = parseName(options.path ?? '.', options.name);
    const target = options.flat ? fullPath : joinPathFragments(fullPath, parsedName);
    const moduleFileName = `${parsedName}.module.ts`;
    const specFileName = `${parsedName}.module.spec.ts`;
    const className = `${parsedName.charAt(0).toUpperCase()}${parsedName.slice(1)}Module`;
    const moduleFilePath = joinPathFragments(target, moduleFileName);
    const specFilePath = joinPathFragments(target, specFileName);

    // Mirror the Angular schematic shape closely enough to validate in-place edits.
    host.write(
      moduleFilePath,
      [
        "import { NgModule } from '@angular/core';",
        "import { CommonModule } from '@angular/common';",
        '',
        '@NgModule({',
        '  imports: [CommonModule]',
        '})',
        `export class ${className} {`,
        '}',
        ''
      ].join('\n')
    );
    host.write(specFilePath, '// generated spec');
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
    (wrapAngularDevkitSchematic as Mock).mockReturnValue(moduleGeneratorMock);
  });

  it('preserves the generated module and appends custom core, forRoot, and ui behavior', async () => {
    await ngModuleGenerator(tree, {
      core: true,
      flat: true,
      forRoot: true,
      name: 'test',
      path: 'libs/demo/src/lib',
      project: 'demo',
      skipFormat: true,
      skipSpec: true,
      ui: true
    });

    const moduleFilePath = 'libs/demo/src/lib/test.module.ts';
    const moduleSource = tree.read(moduleFilePath, 'utf-8');

    expect(moduleGeneratorMock).toHaveBeenCalled();
    expect(moduleSource).toContain(
      "import { ModuleWithProviders, NgModule, Optional, SkipSelf, Type } from '@angular/core';"
    );
    expect(moduleSource).toContain("import { CommonModule } from '@angular/common';");
    expect(moduleSource).toContain(
      "import { throwIfAlreadyLoaded } from '@gamers-source/shared-angular-utils';"
    );
    expect(moduleSource).toContain('const declarations: ReadonlyArray<Type<unknown>> = [];');
    expect(moduleSource).toContain('declarations: [...declarations],');
    expect(moduleSource).toContain('imports: [CommonModule]');
    expect(moduleSource).toContain('exports: [...declarations],');
    expect(moduleSource).toContain('constructor(@Optional() @SkipSelf() parentModule: TestModule)');
    expect(moduleSource).toContain("throwIfAlreadyLoaded(parentModule, 'TestModule');");
    expect(moduleSource).toContain('static forRoot(): ModuleWithProviders<TestModule>');
    expect(tree.exists('libs/demo/src/lib/test.module.spec.ts')).toBe(false);
  });

  it('leaves the Angular module contents intact when no custom options are enabled', async () => {
    await ngModuleGenerator(tree, {
      flat: true,
      name: 'plain',
      path: 'libs/demo/src/lib',
      project: 'demo',
      skipFormat: true
    });

    expect(tree.read('libs/demo/src/lib/plain.module.ts', 'utf-8')).toBe(
      [
        "import { NgModule } from '@angular/core';",
        "import { CommonModule } from '@angular/common';",
        '',
        '@NgModule({',
        '  imports: [CommonModule]',
        '})',
        'export class PlainModule {',
        '}',
        ''
      ].join('\n')
    );
    expect(tree.exists('libs/demo/src/lib/plain.module.spec.ts')).toBe(true);
  });
});
