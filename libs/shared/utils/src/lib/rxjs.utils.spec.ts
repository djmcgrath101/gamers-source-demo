import { firstValueFrom, of } from 'rxjs';
import { isNotNullable, nonNullableProps } from './rxjs.utils';

describe('rxjs.utils', () => {
  describe('isNotNullable', () => {
    it('throws error if null value attempts to pass through stream', async () => {
      return await expect(firstValueFrom(of(null).pipe(isNotNullable()))).rejects.toEqual(
        new Error('Attempting to use nullable value where non-nullable value is expected!')
      );
    });

    it('throws error if undefined value attempts to pass through stream', async () => {
      return await expect(firstValueFrom(of(undefined).pipe(isNotNullable()))).rejects.toEqual(
        new Error('Attempting to use nullable value where non-nullable value is expected!')
      );
    });

    it('does not throw error if value is non-nullable', async () => {
      return await expect(firstValueFrom(of('').pipe(isNotNullable()))).resolves.toBe('');
    });
  });

  describe('nonNullableProps', () => {
    it('throws error if object contains nullable property', async () => {
      return await expect(
        firstValueFrom(of({ bad: null, good: 'abc' }).pipe(nonNullableProps('bad')))
      ).rejects.toEqual(
        new Error(
          `Attempting to use nullable value for "bad" property where non-nullable value is expected!`
        )
      );
    });

    it('does not throw error if desired property is non-nullable', async () => {
      return await expect(
        firstValueFrom(of({ bad: null, good: 'abc' }).pipe(nonNullableProps('good')))
      ).resolves.toMatchObject({ bad: null, good: 'abc' });
    });
  });
});
