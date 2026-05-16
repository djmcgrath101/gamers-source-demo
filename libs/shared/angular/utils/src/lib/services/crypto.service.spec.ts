import { webcrypto } from 'node:crypto';

import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';

import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let spectator: SpectatorService<CryptoService>;

  const createService = createServiceFactory(CryptoService);
  const originalCrypto = globalThis.crypto;

  beforeAll(() => {
    // `jest-preset-angular` does not provide Web Crypto in this project, so
    // use Node's implementation to exercise the service against a real API.
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: webcrypto
    });
  });

  beforeEach(() => {
    spectator = createService();
  });

  afterEach(() => {
    vitest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalCrypto === undefined) {
      Reflect.deleteProperty(globalThis, 'crypto');
      return;
    }

    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto
    });
  });

  it('creates the service', () => {
    expect(spectator.service).toBeTruthy();
  });

  describe('hashSHA512', () => {
    it('returns the SHA-512 hash for the supplied text', async () => {
      await expect(spectator.service.hashSHA512('hello world')).resolves.toBe(
        '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
      );
    });

    it('passes SHA-512 and UTF-8 encoded bytes to crypto.subtle.digest', async () => {
      const digestSpy = vitest
        .spyOn(globalThis.crypto.subtle, 'digest')
        .mockResolvedValue(Uint8Array.from([0, 15, 16, 255]).buffer);
      const inputText = 'Pässword!';

      await expect(spectator.service.hashSHA512(inputText)).resolves.toBe('000f10ff');

      expect(digestSpy).toHaveBeenCalledTimes(1);

      const [algorithm, data] = digestSpy.mock.calls[0];

      expect(algorithm).toBe('SHA-512');
      expect(ArrayBuffer.isView(data)).toBe(true);
      expect(Array.from(new Uint8Array((data as Uint8Array).buffer))).toEqual(
        Array.from(new TextEncoder().encode(inputText))
      );
    });

    it('rethrows Web Crypto digest failures', async () => {
      const error = new Error('digest failed');

      vitest.spyOn(globalThis.crypto.subtle, 'digest').mockRejectedValue(error);

      await expect(spectator.service.hashSHA512('hello world')).rejects.toThrow(error);
    });
  });
});
