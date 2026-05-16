import * as stringUtils from '@angular-devkit/core/src/utils/strings';
import { appendProjectTypeToSourceRootPath } from '@gamers-source/nx-utils';
import { formatFiles, joinPathFragments, names, readProjectConfiguration, Tree } from '@nx/devkit';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
import { parseName } from '@schematics/angular/utility/parse-name';
import { omit } from 'lodash-es';
import {
  NgModuleGeneratorCustomOpts,
  NgModuleGeneratorOptions,
  NormalizedNgModuleGeneratorOptions
} from './schema';

function addNamedImport(sourceText: string, importName: string): string {
  const angularCoreImport = "from '@angular/core';";
  const angularCoreImportRegex = /import\s*{\s*([^}]*)\s*}\s*from '@angular\/core';/;

  if (sourceText.includes(` ${importName}`) || sourceText.includes(`{ ${importName} }`)) {
    return sourceText;
  }

  const angularCoreMatch = sourceText.match(angularCoreImportRegex);

  if (!angularCoreMatch) {
    return sourceText;
  }

  const existingImports = angularCoreMatch[1]
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
  const nextImports = [...new Set([...existingImports, importName])].sort((left, right) =>
    left.localeCompare(right)
  );
  const nextImportStatement = `import { ${nextImports.join(', ')} } ${angularCoreImport}`;

  return sourceText.replace(angularCoreImportRegex, nextImportStatement);
}

function addSupportImport(sourceText: string, importStatement: string): string {
  if (sourceText.includes(importStatement)) {
    return sourceText;
  }

  const angularCoreImport = "from '@angular/core';";
  const insertAt = sourceText.indexOf(angularCoreImport);

  if (insertAt === -1) {
    return `${importStatement}\n${sourceText}`;
  }

  const lineEnd = sourceText.indexOf('\n', insertAt);
  const importInsertIndex = lineEnd === -1 ? sourceText.length : lineEnd + 1;

  return `${sourceText.slice(0, importInsertIndex)}${importStatement}\n${sourceText.slice(
    importInsertIndex
  )}`;
}

function addUiDeclarationsArray(sourceText: string): string {
  const declarationsConst = 'const declarations: ReadonlyArray<Type<unknown>> = [];';
  const ngModuleMarker = '@NgModule({';

  if (sourceText.includes(declarationsConst)) {
    return sourceText;
  }

  const ngModuleIndex = sourceText.indexOf(ngModuleMarker);

  if (ngModuleIndex === -1) {
    return sourceText;
  }

  return `${sourceText.slice(0, ngModuleIndex)}${declarationsConst}\n\n${sourceText.slice(
    ngModuleIndex
  )}`;
}

function addUiMetadata(sourceText: string): string {
  const declarationsLine = '  declarations: [...declarations],';
  const exportsLine = '  exports: [...declarations],';
  const ngModuleStart = sourceText.indexOf('@NgModule({');
  const ngModuleEnd = sourceText.indexOf('})', ngModuleStart);

  if (ngModuleStart === -1 || ngModuleEnd === -1) {
    return sourceText;
  }

  const ngModuleBlock = sourceText.slice(ngModuleStart, ngModuleEnd);
  let nextBlock = ngModuleBlock;

  if (!nextBlock.includes('declarations:')) {
    nextBlock = nextBlock.replace('@NgModule({', `@NgModule({\n${declarationsLine}`);
  }

  if (!nextBlock.includes('exports:')) {
    const importsLineRegex = /^(\s+imports:\s*\[[^\]]*\],?)$/m;

    if (importsLineRegex.test(nextBlock)) {
      nextBlock = nextBlock.replace(importsLineRegex, `$1\n${exportsLine}`);
    } else {
      nextBlock = nextBlock.replace('@NgModule({', `@NgModule({\n${exportsLine}`);
    }
  }

  return `${sourceText.slice(0, ngModuleStart)}${nextBlock}${sourceText.slice(ngModuleEnd)}`;
}

function appendToClassBody(sourceText: string, className: string, addition: string): string {
  const classDeclaration = `export class ${className}`;
  const classIndex = sourceText.indexOf(classDeclaration);

  if (classIndex === -1) {
    return sourceText;
  }

  const classClose = sourceText.lastIndexOf('}');

  if (classClose === -1) {
    return sourceText;
  }

  const beforeClose = sourceText.slice(0, classClose);
  const separator = beforeClose.endsWith('\n') ? '\n' : '\n\n';

  return `${beforeClose}${separator}${addition}\n${sourceText.slice(classClose)}`;
}

function getGeneratedModulePaths(tree: Tree, options: NormalizedNgModuleGeneratorOptions) {
  const { core, flat, forRoot, name, path: schemaPath, project, skipSpec, ui } = options;
  const path =
    schemaPath || appendProjectTypeToSourceRootPath(readProjectConfiguration(tree, project));
  const { name: parsedName, path: fullPath } = parseName(path, name);
  const { fileName } = names(parsedName);
  const className = `${stringUtils.classify(fileName)}Module`.replace('Ui', 'UI');
  const target = flat ? fullPath : joinPathFragments(fullPath, parsedName);
  const moduleFilePath = joinPathFragments(target, `${fileName}.module.ts`);
  const specFilePath = joinPathFragments(target, `${fileName}.module.spec.ts`);

  return {
    className,
    core,
    forRoot,
    moduleFilePath,
    skipSpec,
    specFilePath,
    ui
  };
}

/**
 * Generates an Angular module and applies local conventions without replacing Angular's output.
 */
export async function ngModuleGenerator(tree: Tree, rawOptions: NgModuleGeneratorOptions) {
  const moduleGenerator = wrapAngularDevkitSchematic('@schematics/angular', 'module');
  const options = normalizeOpts(rawOptions);

  // IMPORTANT: The Angular generator will complain about any additional properties
  // in the schema, so specify which are the added properties to omit them.
  const customOpts: Array<keyof NgModuleGeneratorCustomOpts> = [
    'core',
    'forRoot',
    'skipFormat',
    'skipSpec',
    'ui'
  ];

  await moduleGenerator(tree, omit(options, customOpts));

  updateGeneratedModuleFile(tree, options);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default ngModuleGenerator;

function normalizeOpts(opts: NgModuleGeneratorOptions): NormalizedNgModuleGeneratorOptions {
  return {
    ...opts,
    core: opts.core ?? false,
    flat: opts.flat ?? false,
    forRoot: opts.forRoot ?? false,
    skipFormat: opts.skipFormat ?? false,
    skipSpec: opts.skipSpec ?? false,
    ui: opts.ui ?? false
  };
}

function updateGeneratedModuleFile(tree: Tree, options: NormalizedNgModuleGeneratorOptions) {
  const { className, core, forRoot, moduleFilePath, skipSpec, specFilePath, ui } =
    getGeneratedModulePaths(tree, options);
  const moduleBuffer = tree.read(moduleFilePath);

  if (!moduleBuffer) {
    throw new Error(`Expected generated module file to exist at ${moduleFilePath}.`);
  }

  let moduleSource = moduleBuffer.toString('utf-8');

  if (core) {
    moduleSource = addNamedImport(moduleSource, 'Optional');
    moduleSource = addNamedImport(moduleSource, 'SkipSelf');
    moduleSource = addSupportImport(
      moduleSource,
      "import { throwIfAlreadyLoaded } from '@gamers-source/shared-angular-utils';"
    );

    if (!moduleSource.includes('throwIfAlreadyLoaded(parentModule')) {
      const constructorBlock = [
        `  constructor(@Optional() @SkipSelf() parentModule: ${className}) {`,
        `    throwIfAlreadyLoaded(parentModule, '${className}');`,
        '  }'
      ].join('\n');

      moduleSource = appendToClassBody(moduleSource, className, constructorBlock);
    }
  }

  if (forRoot) {
    moduleSource = addNamedImport(moduleSource, 'ModuleWithProviders');

    if (!moduleSource.includes('static forRoot(): ModuleWithProviders<')) {
      const forRootMethod = [
        `  static forRoot(): ModuleWithProviders<${className}> {`,
        '    return {',
        `      ngModule: ${className},`,
        '      providers: []',
        '    };',
        '  }'
      ].join('\n');

      moduleSource = appendToClassBody(moduleSource, className, forRootMethod);
    }
  }

  if (ui) {
    moduleSource = addNamedImport(moduleSource, 'Type');
    moduleSource = addUiDeclarationsArray(moduleSource);
    moduleSource = addUiMetadata(moduleSource);
  }

  tree.write(moduleFilePath, moduleSource);

  if (skipSpec) {
    tree.delete(specFilePath);
  }
}
