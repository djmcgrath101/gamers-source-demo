import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiErrorResponse } from '@gamers-source/shared-angular-data-access';

export function createMockApiError(overrides: Partial<ApiError> = {}): ApiError {
  return {
    type: 'https://example.com/probs/out-of-credits',
    title: 'You do not have enough credits.',
    status: 500,
    errors: [],
    instance: 'instance-id',
    traceId: 'trace-id',
    ...overrides
  };
}

export function createMockApiErrorResponse(overrides: Partial<ApiError> = {}): ApiErrorResponse {
  const error: ApiError = createMockApiError(overrides);

  return new HttpErrorResponse({
    status: error.status,
    error
  });
}
