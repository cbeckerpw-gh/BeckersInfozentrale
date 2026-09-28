/**
 * API Client Module (api.js)
 * Schnittstelle für externe Abrufe über Pipedream als Middleware.
 */

const ApiService = (function () {
    'use strict';

    // Ziel-URL des Pipedream-Endpoints
    const PIPEDREAM_CONFIG = {
        baseUrl: 'https://pipedream.com/@api-endpoint-placeholder',
        timeout: 5000
    };

    /**
     * Führt HTTP-Anfragen mit Timeout aus
     */
    async function request(endpoint, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), PIPEDREAM_CONFIG.timeout);

        const config = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(`\({PIPEDREAM_CONFIG.baseUrl}\){endpoint}`, config);
            clearTimeout(id);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            clearTimeout(id);
            console.error(`API-Fehler (${endpoint}):`, error);
            throw error;
        }
    }

    return {
        get: (endpoint) => request(endpoint, { method: 'GET' }),
        post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) })
    };
})();
