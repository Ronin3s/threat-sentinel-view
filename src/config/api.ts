/**
 * API Configuration
 * 
 * Centralized API endpoint configuration for the Siren Backend.
 * All API calls should use these constants to ensure consistency.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API Endpoints organized by service
 */
export const API_ENDPOINTS = {
    // Process Monitor Service
    process: {
        list: '/api/process/processes',
        metrics: '/api/process/metrics',
        kill: (pid: number) => `/api/process/kill/${pid}`,
        health: '/api/process/health'
    },

    // Integrity Scanner Service
    integrity: {
        scan: (hostId: string) => `/api/integrity/scan/${hostId}`,
        results: (jobId: string) => `/api/integrity/results/${jobId}`
    },

    // IOC Hunting Service
    ioc: {
        hunt: '/api/ioc/hunt',
        results: (huntId: string) => `/api/ioc/results/${huntId}`
    },

    // Behavior Monitor Service
    behavior: {
        events: '/api/behavior/events',
        stream: '/api/behavior/stream'
    },

    // Containment Service
    containment: {
        isolate: (host: string) => `/api/contain/isolate/${host}`,
        block: (ip: string) => `/api/contain/block/${ip}`
    },

    // Report Generation Service
    report: {
        generate: (incidentId: string) => `/api/report/generate/${incidentId}`,
        download: (reportId: string) => `/api/report/download/${reportId}`
    },

    // Global Health Check
    health: '/api/health'
};

/**
 * Helper function to build full API URL
 */
export function buildApiUrl(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper function for GET requests
 */
export async function apiGet(endpoint: string) {
    const response = await fetch(buildApiUrl(endpoint));
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Helper function for POST requests
 */
export async function apiPost(endpoint: string, data?: any) {
    const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}
