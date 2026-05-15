export interface DefaultProjectGeneratorOptions {
  /**
   * Project name to set as the default project in nx.json.
   */
  readonly project: string;
  /**
   * Skip formatting files.
   */
  readonly skipFormat?: boolean;
}
