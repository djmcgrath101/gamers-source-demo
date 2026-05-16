import { compare } from 'semver';
import { simpleGit, SimpleGit } from 'simple-git';

export interface GitRevParseOpts {
  /**
   * The length of the hash to return.  Must be a minimum of 4 characters.
   */
  readonly length?: number;
}

/**
 * Utility class for interacting with Git.
 */
export class GitUtils {
  constructor(private readonly git: SimpleGit = simpleGit()) {}

  /**
   * Determines if a branch already exists.
   *
   * @param branchName The name of the branch to check.
   * @returns A promise that resolves to true if the branch exists, false otherwise.
   */
  async branchExists(branchName: string): Promise<boolean> {
    return (await this.git.branchLocal()).all.includes(branchName);
  }

  /**
   * Gets the hash of the last commit on the current branch.
   *
   * @param opts Options for the rev-parse command.
   * @returns A promise that resolves to the hash of the last commit on the current branch.
   */
  async getLastCommitHash(opts?: GitRevParseOpts): Promise<string> {
    const taskOpts = opts?.length ? [`--short=${opts.length}`] : [];

    return (await this.git.revparse([...taskOpts, 'HEAD'])).trim();
  }

  /**
   * Gets the currently checked out local branch name.
   */
  async getCurrentBranch(): Promise<string> {
    return (await this.git.branchLocal()).current;
  }

  /**
   * Retrieves the latest (most recent) version of a project.
   *
   * @param projectName The name of the project to get the latest version for.
   * @returns The latest version of the project, or undefined if no versions were found.
   */
  async getLatestProjectVersion(projectName: string): Promise<string | undefined> {
    const versions = await this.getProjectVersions(projectName);

    return versions[0];
  }

  /**
   * Gets the local user's email address.  If the email address is not set, an empty string is returned.
   *
   * @returns A promise that resolves to the local user's email address.
   */
  async getLocalUserEmail(): Promise<string> {
    return (await this.git.getConfig('user.email', 'local')).value ?? '';
  }

  /**
   * Gets the local user's name.  If the name is not set, an empty string is returned.
   *
   * @returns A promise that resolves to the local user's name.
   */
  async getLocalUserName(): Promise<string> {
    return (await this.git.getConfig('user.name', 'local')).value ?? '';
  }

  /**
   * Retrieves all the git tag versions matching the specified project name.
   * The tags are expected to be in the format `project@version`.
   *
   * @param projectName The name of the project to get versions for.
   * @param sortDir The direction to sort the versions in.  Defaults to descending (newest to oldest).
   * @returns The list of versions for the project
   */
  async getProjectVersions(
    projectName: string,
    sortDir: 'asc' | 'desc' = 'desc'
  ): Promise<readonly string[]> {
    const projectTags = await this.getTagsMatching(projectName);

    return projectTags
      .map(tag => tag.split('@')[1])
      .sort((a, b) => (sortDir === 'asc' ? compare(a, b) : compare(b, a)));
  }

  /**
   * Gets a list of tags containing the specified tag name.
   *
   * @param tagName The tag name to search for.
   * @returns A promise that resolves to a list of tags containing the specified tag name.
   */
  async getTagsMatching(tagName: string): Promise<string[]> {
    const tags = await this.git.tags();

    return tags.all.filter(tag => tag.includes(tagName));
  }

  /**
   * Determines if the current branch has no uncommitted changes.
   *
   * @returns A promise that resolves to true if the branch is clean, false otherwise.
   */
  async isCleanBranch(): Promise<boolean> {
    return (await this.git.status(['--porcelain'])).isClean();
  }

  /**
   * Determines if the current branch is the specified branch.
   *
   * @param branchName The name of the branch to check.
   * @returns A promise that resolves to true if the current branch is the specified branch, false otherwise.
   */
  async isCurrentBranch(branchName: string): Promise<boolean> {
    return (await this.git.branchLocal()).current === branchName;
  }
}
