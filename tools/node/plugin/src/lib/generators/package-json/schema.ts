import { SetRequired } from 'type-fest';

export interface PackageJsonGeneratorOptions {
  /**
   * Dependency package names to copy from the root package.json into the generated package.json.
   */
  readonly dependencies?: readonly string[];
  /**
   * The directory where the package.json will be created.
   */
  readonly dir: string;
  /**
   * The generated package entry point.
   */
  readonly main?: string;
  /**
   * The name of the package.  The npmScope will be automatically prepended.
   */
  readonly name: string;
  /**
   * The Node.js semver range to write to engines.node.
   */
  readonly nodeEngine?: string;
  /**
   * If true, replace an existing package.json.  Defaults to false.
   */
  readonly overwrite?: boolean;
  /**
   * If true, the package will be marked as private.  Default is true.
   */
  readonly private?: boolean;
  /**
   * Skip formatting files.  Defaults to false.
   */
  readonly skipFormat?: boolean;
  /**
   * The npm start script command.
   */
  readonly startScript?: string;
  /**
   * The semantic version of the package.  Defaults to '0.0.1'.
   */
  readonly vers?: string;
}

export type NormalizedPackageJsonGeneratorOptions = SetRequired<
  Omit<PackageJsonGeneratorOptions, 'dependencies'>,
  'overwrite' | 'private' | 'vers'
> & {
  /**
   * Dependency versions resolved from the root package.json.
   */
  readonly dependencies?: Readonly<Record<string, string>>;
};
