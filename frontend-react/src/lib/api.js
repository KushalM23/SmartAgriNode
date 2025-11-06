const API_BASE = '/api';

/**
 * Make authenticated API request with Clerk token
 * @param {string} path - API endpoint path
 * @param {object} options - Fetch options
 * @param {string} token - Clerk authentication token
 */
async function request(path, options = {}, token = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // Add Clerk token if provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers,
        ...options
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
        const message = body && body.error ? body.error : response.statusText;
        throw new Error(message);
    }

    return body;
}

export const api = {
    // Health check (no auth required)
    healthCheck: () => request('/health', { method: 'GET' }),

    // ML endpoints (require Clerk token)
    cropRecommendation: (payload, token) => 
        request('/crop-recommendation', { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        }, token),

    weedDetection: async (file, token) => {
        const form = new FormData();
        form.append('image', file);
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/weed-detection`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: form
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || res.statusText);
        return data;
    },

    // User history (requires Clerk token)
    history: (token) => request('/history', { method: 'GET' }, token)
};

