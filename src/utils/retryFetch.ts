export const retryFetch = async (
  url: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> => {
  let lastError: Error | null = null;

  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const response = await fetch(url, options);
      
      // Only retry on rate limit errors
      if (response.status !== 429) {
        return response;
      }

      lastError = new Error(`Rate limit exceeded (429)`);
    } catch (error) {
      lastError = error as Error;
    }

    if (retry < maxRetries) {
      // Exponential backoff: 2^retry * 1000ms (1s, 2s, 4s, ...)
      const delay = Math.min(2 ** retry * 1000, 10000); // Cap at 10 seconds
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
};
