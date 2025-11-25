/**
 * SIREN API Client
 * 
 * Centralized API client for all backend services.
 * Connects to Python Flask backend at http://localhost:8000
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

export interface Process {
    pid: number;
    name: string;
    user: string;
    cpu_percent: number;
    memory_percent: number;
    memory_mb: number;
    status: string;
    exe_path: string;
    risk_score: number;
    risk_reason: string;
}

export interface SystemMetrics {
    cpu_percent: number;
    memory_percent: number;
    memory_used_gb: number;
    memory_total_gb: number;
    disk_used_gb: number;
    disk_total_gb: number;
    disk_percent: number;
    timestamp: string;
}

export interface ScanJob {
    job_id: string;
    host: string;
    status: 'running' | 'completed' | 'failed';
    timestamp: string;
    files_scanned?: number;
    baseline_score?: number;
    severity?: string;
    changes?: Array<{
        path: string;
        change: string;
        hash?: string;
        severity: string;
    }>;
}

export interface IOCHunt {
    hunt_id: string;
    ioc_type: string;
    ioc_value: string;
    status: 'running' | 'completed' | 'failed';
    started_at: string;
    completed_at?: string;
    matches?: Array<{
        host: string;
        evidence: string;
        first_seen: string;
        confidence: string;
    }>;
    hosts_scanned?: number;
    matches_found?: number;
}

export interface BehaviorEvent {
    event_id: string;
    type: string;
    host: string;
    process: string;
    pid: number;
    parent: string;
    behavior: string[];
    severity: string;
    confidence: string;
    timestamp: string;
    details?: any;
}

export interface ContainmentAction {
    action_id: string;
    status: string;
    host?: string;
    ip_address?: string;
    message: string;
    timestamp: string;
}

export interface IncidentReport {
    report_id: string;
    incident_id: string;
    title: string;
    generated_at: string;
    severity: string;
    summary: string;
    impact: string;
    timeline: Array<{ time: string; event: string }>;
    actions_taken: string[];
    evidence_collected: Array<{ type: string; value: string; location?: string }>;
    recommendations: string[];
}

// ============================================================================
// BASE API FUNCTIONS
// ============================================================================

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request failed: ${endpoint}`, error);
        throw error;
    }
}

function apiGet<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET' });
}

function apiPost<T>(endpoint: string, data?: any): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

function apiDelete<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// ============================================================================
// PROCESS MONITOR API
// ============================================================================

export const processApi = {
    /**
     * Get all running processes with risk scores
     */
    getProcesses: () => apiGet<{ processes: Process[] }>('/api/process/processes'),

    /**
     * Get system metrics (CPU, memory, disk)
     */
    getMetrics: () => apiGet<{ history: SystemMetrics[] }>('/api/process/metrics'),

    /**
     * Kill a process by PID
     */
    killProcess: (pid: number) => apiPost<{ status: string; message: string }>(`/api/process/kill/${pid}`),

    /**
     * Get process service health
     */
    getHealth: () => apiGet<{ status: string; service: string }>('/api/process/health'),
};

// ============================================================================
// INTEGRITY SCANNER API
// ============================================================================

export const integrityApi = {
    /**
     * Start integrity scan for a host
     */
    startScan: (hostId: string, scanPaths?: string[]) =>
        apiPost<{ job_id: string; status: string }>(`/api/integrity/scan/${hostId}`, {
            scan_paths: scanPaths,
        }),

    /**
     * Get scan results by job ID
     */
    getScanResults: (jobId: string) => apiGet<ScanJob>(`/api/integrity/results/${jobId}`),

    /**
     * Get baseline for a host
     */
    getBaseline: (hostId: string) =>
        apiGet<{ host_id: string; created_at: string; file_count: number }>(`/api/integrity/baseline/${hostId}`),

    /**
     * Create baseline for a host
     */
    createBaseline: (hostId: string) =>
        apiPost<{ status: string; job_id: string }>(`/api/integrity/baseline/${hostId}`),

    /**
     * List all scans
     */
    listScans: (hostId?: string) =>
        apiGet<{ scans: any[]; count: number }>(`/api/integrity/scans${hostId ? `/${hostId}` : ''}`),

    /**
     * Get service health
     */
    getHealth: () => apiGet<{ status: string; service: string }>('/api/integrity/health'),
};

// ============================================================================
// IOC HUNTING API
// ============================================================================

export const iocApi = {
    /**
     * Start IOC hunt
     */
    startHunt: (iocType: string, iocValue: string) =>
        apiPost<{ hunt_id: string; status: string }>('/api/ioc/hunt', {
            ioc_type: iocType,
            ioc_value: iocValue,
        }),

    /**
     * Get hunt results
     */
    getHuntResults: (huntId: string) => apiGet<IOCHunt>(`/api/ioc/results/${huntId}`),

    /**
     * List all hunts
     */
    listHunts: (status?: string) =>
        apiGet<{ hunts: any[]; count: number }>(`/api/ioc/hunts${status ? `?status=${status}` : ''}`),

    /**
     * Get evidence for a host
     */
    getHostEvidence: (host: string) =>
        apiGet<{ host: string; evidence: any[]; count: number }>(`/api/ioc/evidence/${host}`),

    /**
     * Add evidence
     */
    addEvidence: (host: string, evidenceType: string, evidenceValue: string, location: string) =>
        apiPost<{ status: string }>('/api/ioc/evidence', {
            host,
            evidence_type: evidenceType,
            evidence_value: evidenceValue,
            location,
        }),

    /**
     * Analyze IOC prevalence
     */
    analyzePrevalence: (iocType: string, iocValue: string) =>
        apiPost<any>('/api/ioc/analyze', {
            ioc_type: iocType,
            ioc_value: iocValue,
        }),

    /**
     * Get service health
     */
    getHealth: () => apiGet<{ status: string; service: string }>('/api/ioc/health'),
};

// ============================================================================
// BEHAVIOR MONITOR API
// ============================================================================

export const behaviorApi = {
    /**
     * Get recent behavioral events
     */
    getEvents: (limit: number = 50, severity?: string) =>
        apiGet<{ events: BehaviorEvent[]; count: number }>(
            `/api/behavior/events?limit=${limit}${severity ? `&severity=${severity}` : ''}`
        ),

    /**
     * Analyze behavior for a specific process
     */
    analyzeBehavior: (host: string, pid: number) =>
        apiPost<any>('/api/behavior/analyze', { host, pid }),

    /**
     * Get monitoring statistics
     */
    getStatistics: () =>
        apiGet<{
            total_events: number;
            by_severity: { low: number; medium: number; high: number };
            unique_hosts: number;
            unique_processes: number;
        }>('/api/behavior/statistics'),

    /**
     * Generate mock events for testing
     */
    simulateEvents: (eventCount: number = 10) =>
        apiPost<{ status: string; generated: number; event_ids: string[] }>('/api/behavior/simulate', {
            event_count: eventCount,
        }),

    /**
     * Get detection rules
     */
    getRules: () => apiGet<{ rules: any[]; count: number }>('/api/behavior/rules'),

    /**
     * Add custom event
     */
    addEvent: (event: Partial<BehaviorEvent>) =>
        apiPost<{ status: string; event_id: string }>('/api/behavior/event', event),

    /**
     * Clear all events (testing)
     */
    clearEvents: () => apiDelete<{ status: string; cleared: number }>('/api/behavior/events'),

    /**
     * Get service health
     */
    getHealth: () => apiGet<{ status: string; service: string }>('/api/behavior/health'),
};

// ============================================================================
// CONTAINMENT API
// ============================================================================

export const containmentApi = {
    /**
     * Isolate a host from network
     */
    isolateHost: (host: string, reason?: string) =>
        apiPost<ContainmentAction>(`/api/contain/isolate/${host}`, { reason }),

    /**
     * Restore host from isolation
     */
    restoreHost: (host: string) => apiPost<ContainmentAction>(`/api/contain/restore/${host}`),

    /**
     * Block an IP address
     */
    blockIp: (ip: string, reason?: string) =>
        apiPost<ContainmentAction>(`/api/contain/block/${ip}`, { reason }),

    /**
     * Unblock an IP address
     */
    unblockIp: (ip: string) => apiDelete<ContainmentAction>(`/api/contain/block/${ip}`),

    /**
     * Quarantine a file
     */
    quarantineFile: (filePath: string, host: string) =>
        apiPost<ContainmentAction>('/api/contain/quarantine', {
            file_path: filePath,
            host,
        }),

    /**
     * Get containment status for a host
     */
    getHostStatus: (host: string) =>
        apiGet<{
            host: string;
            isolated: boolean;
            action_count: number;
            recent_actions: any[];
        }>(`/api/contain/status/${host}`),

    /**
     * List blocked IPs
     */
    listBlockedIps: () => apiGet<{ blocked_ips: string[]; count: number }>('/api/contain/blocked-ips'),

    /**
     * List isolated hosts
     */
    listIsolatedHosts: () => apiGet<{ isolated_hosts: string[]; count: number }>('/api/contain/isolated-hosts'),

    /**
     * Rollback an action
     */
    rollbackAction: (actionId: string) =>
        apiPost<{ status: string; message: string }>(`/api/contain/rollback/${actionId}`),

    /**
     * Get action history
     */
    getHistory: (limit: number = 50) =>
        apiGet<{ actions: any[]; count: number }>(`/api/contain/history?limit=${limit}`),

    /**
     * Get statistics
     */
    getStatistics: () =>
        apiGet<{
            total_actions: number;
            isolated_hosts: number;
            blocked_ips: number;
            quarantined_files: number;
        }>('/api/contain/statistics'),

    /**
     * Get service health
     */
    getHealth: () => apiGet<{ status: string; service: string }>('/api/contain/health'),
};

// ============================================================================
// REPORT GENERATION API
// ============================================================================

export const reportApi = {
    /**
     * Generate incident report
     */
    generateReport: (incidentId: string, format: string = 'json') =>
        apiPost<{ status: string; report_id: string; download_url: string }>(
            `/api/report/generate/${incidentId}`,
            { format }
        ),

    /**
     * Download a report
     */
    downloadReport: (reportId: string, format: string = 'json') =>
        apiGet<IncidentReport>(`/api/report/download/${reportId}?format=${format}`),

    /**
     * List all reports
     */
    listReports: (incidentId?: string) =>
        apiGet<{ reports: any[]; count: number }>(`/api/report/list${incidentId ? `?incident_id=${incidentId}` : ''}`),

    /**
     * Get report details
     */
    getReport: (reportId: string) => apiGet<IncidentReport>(`/api/report/${reportId}`),

    /**
     * List all incidents
     */
    listIncidents: () => apiGet<{ incidents: any[]; count: number }>('/api/report/incidents'),

    /**
     * Get incident details
     */
    getIncident: (incidentId: string) => apiGet<any>(`/api/report/incident/${incidentId}`),

    /**
     * Create custom report
     */
    createCustomReport: (title: string, sections: Record<string, any>) =>
        apiPost<{ status: string; report_id: string }>('/api/report/custom', {
            title,
            sections,
        }),

    /**
     * Get service health
     */
    getHealth: () => apiGet<{ status: string; service: string }>('/api/report/health'),
};

// ============================================================================
// GLOBAL API
// ============================================================================

export const globalApi = {
    /**
     * Get global system health
     */
    getHealth: () =>
        apiGet<{
            status: string;
            timestamp: string;
            services: Record<string, any>;
        }>('/api/health'),
};

// ============================================================================
// EXPORT DEFAULT CLIENT
// ============================================================================

const sirenApi = {
    process: processApi,
    integrity: integrityApi,
    ioc: iocApi,
    behavior: behaviorApi,
    containment: containmentApi,
    report: reportApi,
    global: globalApi,
};

export default sirenApi;
