export interface ApiConfig {
  /**
   * Optional URL scheme, hostname and port for the
   * API server.  This should be normalized to exclude
   * any trailing slash.
   * @example "https://api.example.com"
   */
  readonly baseUrl?: string;
  /**
   * Optional prefix to be prepended to every API path.
   * This should be normalized to include a leading slash
   * but exclude any trailing slash.
   * @example "/api"
   */
  readonly pathPrefix?: string;
}
