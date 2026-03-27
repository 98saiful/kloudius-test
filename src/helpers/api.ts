const API_TIMEOUT_MS = 12000;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const parseErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
  }

  return fallback;
};

const safeJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export const apiRequest = async (url: string, options?: FetchOptions): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const payload = await safeJson(response);

    if (!response.ok) {
      const message = parseErrorMessage(payload, 'Request failed. Please try again.');
      throw new ApiError(message, response.status);
    }

    return payload;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please try again.', 0, 'TIMEOUT');
    }

    throw new ApiError('Network error. Check your internet connection and retry.', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
};
