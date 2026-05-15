export type VersionData = Record<string, VersionDataEntry>;

export interface VersionDataEntry {
  currentVersion: string;
  /**
   * newVersion will be null in the case that no changes are detected for the project,
   * e.g. when using conventional commits
   */
  newVersion: string | null;
  /**
   * The list of projects which depend upon the current project.
   */
  dependentProjects: {
    source: string;
    target: string;
    type: string;
    dependencyCollection: string;
    rawVersionSpec: string;
  }[];
}
