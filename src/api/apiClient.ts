/**
 * API Client for SOC Dashboard
 * 
 * This module provides a wrapper around fetch for all API calls.
 * 
 * TODO: Replace mock implementations with real backend calls
 * Backend should be available at: http://localhost:4000 (or configured via env)
 * 
 * Expected endpoints:
 * - POST /api/host/scan → {jobId}
 * - GET /api/host/scan/:jobId → scan results
 * - GET /api/behavior/recent?limit=50 → behavior events
 * - POST /api/actions/kill → {status, pid}
 * - ws://localhost:4000/telemetry/behavior → WebSocket for real-time events
 * - POST /api/ioc/hunt → {hunt_id}
 * - GET /api/ioc/hunt/:id → hunt results
 * - GET /api/incidents/:id/killchain → kill chain data
 * - GET /api/playbooks → playbook list
 * - POST /api/playbooks → create playbook
 * - POST /api/incidents/:id/playbook/execute → execute playbook
 * - POST /api/incidents/:id/report → {report_id, report_url}
 * - GET /api/reports/:id → report data
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Mock delay to simulate network latency
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export interface ScanJob {
  jobId: string;
  host: string;
  timestamp: string;
  baseline_score: number;
  changes: Array<{
    path?: string;
    reg_key?: string;
    change: string;
    hash?: string;
  }>;
  severity: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface BehaviorEvent {
  event_id: string;
  type: string;
  host: string;
  process: string;
  pid: number;
  parent: string;
  behavior: string[];
  confidence: string;
  severity: string;
  timestamp: string;
}

export interface IOCHunt {
  hunt_id: string;
  ioc_type: string;
  ioc_value: string;
  status: 'pending' | 'running' | 'completed';
  matches: Array<{
    host: string;
    first_seen: string;
    evidence: string;
  }>;
}

export interface KillChainStage {
  stage: string;
  evidence: string[];
  timestamp?: string;
}

export interface Playbook {
  id: string;
  name: string;
  trigger: string;
  actions: Array<{
    action: string;
    params: Record<string, any>;
  }>;
  mode: 'suggest' | 'semi-auto' | 'full-auto';
  enabled: boolean;
}

export interface IncidentReport {
  report_id: string;
  incident_id: string;
  summary: string;
  impact: string;
  actions_taken: string[];
  recommendations: string[];
  generated_at: string;
  pdf_url?: string;
}

// Host Scan APIs
export const startHostScan = async (hostId: string): Promise<{ jobId: string }> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/host/scan`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ hostId })
  // }).then(r => r.json());
  
  return { jobId: `scan-${Date.now()}` };
};

export const getScanJob = async (jobId: string): Promise<ScanJob> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/host/scan/${jobId}`).then(r => r.json());
  
  return {
    jobId,
    host: "WIN-SRV-01",
    timestamp: new Date().toISOString(),
    baseline_score: Math.floor(Math.random() * 30) + 70,
    changes: [
      { path: "C:\\Users\\Public\\temp.exe", change: "new", hash: "abc123..." },
      { reg_key: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", change: "modified" },
      { path: "C:\\Windows\\System32\\drivers\\etc\\hosts", change: "modified" }
    ],
    severity: Math.random() > 0.5 ? "medium" : "high",
    status: "completed"
  };
};

export const getHostBaseline = async (hostId: string) => {
  await mockDelay();
  // TODO: Replace with actual API call
  return {
    hostId,
    lastScan: new Date(Date.now() - 86400000).toISOString(),
    baselineScore: 95,
    files: 1247,
    registryKeys: 342
  };
};

// Behavior Monitor APIs
export const getRecentBehavior = async (limit: number = 50): Promise<BehaviorEvent[]> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/behavior/recent?limit=${limit}`).then(r => r.json());
  
  const events: BehaviorEvent[] = [];
  for (let i = 0; i < Math.min(limit, 10); i++) {
    events.push({
      event_id: `beh-${String(i).padStart(4, '0')}`,
      type: "behavior_alert",
      host: `workstation-${Math.floor(Math.random() * 50)}`,
      process: ["powershell.exe", "cmd.exe", "rundll32.exe", "regsvr32.exe"][Math.floor(Math.random() * 4)],
      pid: Math.floor(Math.random() * 9000) + 1000,
      parent: "explorer.exe",
      behavior: [
        ["child_from_temp_folder", "encoded_command_executed"],
        ["outbound_conn_unusual", "registry_modification"],
        ["file_created_startup", "process_injection"]
      ][Math.floor(Math.random() * 3)],
      confidence: Math.random() > 0.5 ? "high" : "medium",
      severity: Math.random() > 0.7 ? "high" : "medium",
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
    });
  }
  return events;
};

export const killProcess = async (host: string, pid: number): Promise<{ status: string; pid: number }> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/actions/kill`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ host, pid })
  // }).then(r => r.json());
  
  return { status: "success", pid };
};

export const isolateHost = async (host: string): Promise<{ status: string; host: string }> => {
  await mockDelay();
  // TODO: Replace with actual API call
  return { status: "success", host };
};

export const collectEvidence = async (host: string, type: string): Promise<{ status: string; evidence_id: string }> => {
  await mockDelay();
  // TODO: Replace with actual API call
  return { status: "success", evidence_id: `ev-${Date.now()}` };
};

// IOC Hunt APIs
export const startIOCHunt = async (iocType: string, iocValue: string): Promise<{ hunt_id: string }> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/ioc/hunt`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ioc_type: iocType, ioc_value: iocValue })
  // }).then(r => r.json());
  
  return { hunt_id: `hunt-${Date.now()}` };
};

export const getIOCHunt = async (huntId: string): Promise<IOCHunt> => {
  await mockDelay(1000);
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/ioc/hunt/${huntId}`).then(r => r.json());
  
  const matchCount = Math.floor(Math.random() * 5);
  return {
    hunt_id: huntId,
    ioc_type: "file_hash",
    ioc_value: "b40f6b2c167239519fcfb2028ab2524a",
    status: "completed",
    matches: Array.from({ length: matchCount }, (_, i) => ({
      host: `WIN-SRV-${String(i + 1).padStart(2, '0')}`,
      first_seen: new Date(Date.now() - Math.random() * 172800000).toISOString(),
      evidence: `C:\\temp\\malware_${i}.exe`
    }))
  };
};

// Kill Chain APIs
export const getIncidentKillChain = async (incidentId: string): Promise<{ incident_id: string; stages: KillChainStage[] }> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/incidents/${incidentId}/killchain`).then(r => r.json());
  
  return {
    incident_id: incidentId,
    stages: [
      { stage: "reconnaissance", evidence: ["port_scan_detected", "network_enumeration"] },
      { stage: "weaponization", evidence: ["malicious_payload_created"] },
      { stage: "delivery", evidence: ["phishing_email_clicked", "download_initiated"] },
      { stage: "exploitation", evidence: ["vulnerability_exploited", "code_execution"] },
      { stage: "installation", evidence: ["persistence_mechanism", "registry_modification"] },
      { stage: "command_control", evidence: ["c2_connection_established", "beacon_traffic"] },
      { stage: "actions", evidence: ["data_exfiltration", "lateral_movement"] }
    ].slice(0, Math.floor(Math.random() * 4) + 3)
  };
};

// Playbook APIs
export const getPlaybooks = async (): Promise<Playbook[]> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/playbooks`).then(r => r.json());
  
  return [
    {
      id: "pb-1",
      name: "Ransomware Response",
      trigger: "behavior_high + file_encryption_detected",
      actions: [
        { action: "isolate_host", params: {} },
        { action: "kill_process", params: { process_name: "suspicious_process" } },
        { action: "collect_evidence", params: { type: "memory_dump" } }
      ],
      mode: "semi-auto",
      enabled: true
    },
    {
      id: "pb-2",
      name: "C2 Communication Block",
      trigger: "network_anomaly + known_c2_ip",
      actions: [
        { action: "block_ip", params: {} },
        { action: "isolate_host", params: {} },
        { action: "notify_analyst", params: {} }
      ],
      mode: "full-auto",
      enabled: true
    },
    {
      id: "pb-3",
      name: "Privilege Escalation Response",
      trigger: "privilege_escalation_detected",
      actions: [
        { action: "kill_process", params: {} },
        { action: "collect_evidence", params: { type: "process_memory" } },
        { action: "reset_credentials", params: {} }
      ],
      mode: "suggest",
      enabled: false
    }
  ];
};

export const createPlaybook = async (playbook: Omit<Playbook, 'id'>): Promise<Playbook> => {
  await mockDelay();
  // TODO: Replace with actual API call
  return { ...playbook, id: `pb-${Date.now()}` };
};

export const executePlaybook = async (incidentId: string, playbookId: string): Promise<{ status: string; execution_id: string; results: any[] }> => {
  await mockDelay(1500);
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/incidents/${incidentId}/playbook/execute`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ playbook_id: playbookId })
  // }).then(r => r.json());
  
  return {
    status: "completed",
    execution_id: `exec-${Date.now()}`,
    results: [
      { action: "isolate_host", status: "success", details: "Host isolated successfully" },
      { action: "kill_process", status: "success", details: "Process terminated (PID: 3456)" },
      { action: "collect_evidence", status: "success", details: "Memory dump collected (2.4 GB)" }
    ]
  };
};

// Report APIs
export const generateIncidentReport = async (incidentId: string): Promise<{ report_id: string; report_url: string }> => {
  await mockDelay(2000);
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/incidents/${incidentId}/report`, {
  //   method: 'POST'
  // }).then(r => r.json());
  
  const reportId = `rep-${Date.now()}`;
  return {
    report_id: reportId,
    report_url: `/reports/${reportId}.pdf`
  };
};

export const getIncidentReport = async (reportId: string): Promise<IncidentReport> => {
  await mockDelay();
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/api/reports/${reportId}`).then(r => r.json());
  
  return {
    report_id: reportId,
    incident_id: "inc-20251014-22",
    summary: "Malicious PowerShell execution led to persistence via scheduled task. Attacker attempted lateral movement but was contained.",
    impact: "3 hosts affected, no confirmed data exfiltration. Estimated 2 hours of downtime for forensic collection.",
    actions_taken: [
      "Isolated affected hosts from network",
      "Terminated malicious processes (PIDs: 3456, 3457, 3458)",
      "Collected memory dumps and disk images",
      "Removed persistence mechanisms",
      "Reset compromised credentials"
    ],
    recommendations: [
      "Apply Windows Defender Application Control (WDAC) policies",
      "Disable PowerShell for standard user accounts",
      "Implement application whitelisting for critical servers",
      "Add YARA rule for observed malware hash",
      "Conduct security awareness training on phishing"
    ],
    generated_at: new Date().toISOString(),
    pdf_url: `/reports/${reportId}.pdf`
  };
};
