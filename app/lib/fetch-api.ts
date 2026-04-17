// Lightweight fetch-based API client to replace axios
// Reduces bundle size and improves performance

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

const createFetchApi = (baseURL: string, defaultTimeout = 30000) => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const request = async <T = any>(
    endpoint: string,
    options: FetchOptions = {},
    retries = 3
  ): Promise<T> => {
    const { timeout = defaultTimeout, ...fetchOptions } = options;
    
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${baseURL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`[fetch-api] GET ${url}`);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);
      console.log(`[fetch-api] Response status: ${response.status}`);

      if (!response.ok) {
        // Handle 429 rate limit with retry and jitter
        if (response.status === 429 && retries > 0) {
          const attempt = 3 - retries; // 1, 2, 3
          const baseDelay = Math.min(Math.pow(2, attempt) * 1000, 5000); // 1s, 2s, 4s
          const jitter = Math.random() * 500; // 0-500ms random jitter
          const delay = baseDelay + jitter;
          console.warn(`Rate limited (429), retrying in ${Math.round(delay)}ms... (${retries} retries left)`);
          await sleep(delay);
          return request<T>(endpoint, options, retries - 1);
        }
        
        // Try to parse error response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Ignore error parsing failures
        }
        
        throw new FetchError(errorMessage, response.status, response);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        console.log(`[fetch-api] Empty response for ${url}`);
        return {} as T;
      }
      
      if (contentType && contentType.includes('application/json')) {
        const json = JSON.parse(text);
        console.log(`[fetch-api] JSON response for ${url}:`, json);
        return json;
      }
      
      return text as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`[fetch-api] Timeout for ${url}`);
          throw new FetchError('Request timeout', undefined, undefined);
        }
        // Don't log 404 errors or 'not found' errors as they're often expected
        const isNotFound = error.message?.includes('404') || 
                          error.message?.includes('status: 404') ||
                          error.message?.toLowerCase().includes('not found');
        if (!isNotFound) {
          console.error(`[fetch-api] Error for ${url}:`, error.message);
        }
        throw new FetchError(error.message, (error as FetchError).status, (error as FetchError).response);
      }
      
      console.error(`[fetch-api] Unknown error for ${url}:`, error);
      throw new FetchError('Unknown error occurred');
    }
  };

  return {
    get: <T = any>(endpoint: string, options?: FetchOptions) => 
      request<T>(endpoint, { ...options, method: 'GET' }),
    
    post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) => 
      request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),
    
    put: <T = any>(endpoint: string, data?: any, options?: FetchOptions) => 
      request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),
    
    patch: <T = any>(endpoint: string, data?: any, options?: FetchOptions) => 
      request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
    
    delete: <T = any>(endpoint: string, options?: FetchOptions) => 
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  };
};

// Create API instance
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const isLocalRaw = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(rawBaseUrl);
const API_BASE_URL = rawBaseUrl.startsWith('http://') && !isLocalRaw
  ? rawBaseUrl.replace(/^http:\/\//i, 'https://')
  : rawBaseUrl;

export const api = createFetchApi(API_BASE_URL);

// Export for testing or custom instances
export { createFetchApi, FetchError };
export default api;
