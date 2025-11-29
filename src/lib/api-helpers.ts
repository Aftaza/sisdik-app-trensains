/**
 * Helper function to unwrap API response if it's wrapped in { data: ... }
 * This handles the case where backend returns { data: [...] } instead of [...]
 */
export function unwrapResponse<T>(response: any): T {
    // If response has a 'data' property and it's the actual data we want
    if (response && typeof response === 'object' && 'data' in response) {
        return response.data as T;
    }
    // Otherwise return as-is
    return response as T;
}

/**
 * Helper to check if response is an array
 */
export function ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return data.data;
    }
    return [];
}
