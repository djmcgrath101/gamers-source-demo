export function dryRunEnabled(): boolean {
  return process.env['NX_DRY_RUN'] === 'true';
}

export function verboseEnabled(): boolean {
  return process.env['NX_VERBOSE_LOGGING'] === 'true';
}
