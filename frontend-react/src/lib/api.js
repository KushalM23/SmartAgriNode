const API_BASE = '/api';

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
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
    // Auth
    getUser: () => request('/user', { method: 'GET' }),
    login: (username, password) => request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    register: (username, email, password) => request('/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
    logout: () => request('/logout', { method: 'POST' }),

    // ML
    cropRecommendation: (payload) => request('/crop-recommendation', { method: 'POST', body: JSON.stringify(payload) }),
    weedDetection: async (file) => {
        const form = new FormData();
        form.append('image', file);
        const res = await fetch(`${API_BASE}/weed-detection`, {
            method: 'POST',
            credentials: 'include',
            body: form
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || res.statusText);
        return data;
    }
};


