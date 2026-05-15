export interface ReleaseManifest {
  readonly author: string;
  readonly releaseCommit: string;
  readonly releaseDate: string; // ISO 8601 format
  readonly version: string;
}
