import { dryRunEnabled, verboseEnabled } from './nx-env.utils';

describe('nx-env.utils', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('dryRunEnabled', () => {
    it('returns true when NX_DRY_RUN is "true"', () => {
      process.env['NX_DRY_RUN'] = 'true';

      expect(dryRunEnabled()).toBe(true);
    });

    it('returns false when NX_DRY_RUN is "false"', () => {
      process.env['NX_DRY_RUN'] = 'false';

      expect(dryRunEnabled()).toBe(false);
    });

    it('returns false when NX_DRY_RUN is undefined', () => {
      delete process.env['NX_DRY_RUN'];

      expect(dryRunEnabled()).toBe(false);
    });
  });

  describe('verboseEnabled', () => {
    it('returns true when NX_VERBOSE_LOGGING is "true"', () => {
      process.env['NX_VERBOSE_LOGGING'] = 'true';

      expect(verboseEnabled()).toBe(true);
    });

    it('returns false when NX_VERBOSE_LOGGING is "false"', () => {
      process.env['NX_VERBOSE_LOGGING'] = 'false';

      expect(verboseEnabled()).toBe(false);
    });

    it('returns false when NX_VERBOSE_LOGGING is undefined', () => {
      delete process.env['NX_VERBOSE_LOGGING'];

      expect(verboseEnabled()).toBe(false);
    });
  });
});
