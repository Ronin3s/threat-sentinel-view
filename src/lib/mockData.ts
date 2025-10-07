import { Incident } from "@/components/incidents/IncidentTable";

export interface UserAction {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  incidentId?: string;
  type: "incident" | "rule" | "system";
}

export interface TimelineStage {
  stage: string;
  timestamp: string;
  status: "completed" | "in-progress" | "pending";
  description: string;
  analyst?: string;
}

export interface ProcessNode {
  name: string;
  pid: string;
  status: "normal" | "suspicious" | "malicious";
  children?: ProcessNode[];
}

// Mock incident data
export const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    timestamp: "2025-10-07 14:32:15",
    type: "Malware Detection",
    source: "192.168.1.105",
    severity: "Critical",
    status: "Active",
    description: "Suspicious executable detected attempting to establish C2 connection",
    processName: "malware.exe",
    affectedFile: "C:\\Users\\Admin\\Downloads\\malware.exe",
    analysis: "MD5 hash matches known malware signature in VirusTotal database. Process attempted to connect to known malicious IP 185.220.101.45",
  },
  {
    id: "INC-002",
    timestamp: "2025-10-07 14:15:42",
    type: "Privilege Escalation",
    source: "WORKSTATION-02",
    severity: "High",
    status: "Investigating",
    description: "Unauthorized privilege escalation attempt via token manipulation",
    processName: "cmd.exe",
    affectedFile: "C:\\Windows\\System32\\cmd.exe",
    analysis: "Process attempted to duplicate SYSTEM token and gain elevated privileges without proper authorization",
  },
  {
    id: "INC-003",
    timestamp: "2025-10-07 13:58:22",
    type: "Network Anomaly",
    source: "192.168.1.87",
    severity: "Medium",
    status: "Active",
    description: "Unusual outbound traffic to multiple destinations",
    processName: "chrome.exe",
    analysis: "Detected data exfiltration pattern with 2.3GB transferred to cloud storage services in 10 minutes",
  },
  {
    id: "INC-004",
    timestamp: "2025-10-07 13:45:10",
    type: "File Integrity",
    source: "SERVER-01",
    severity: "Low",
    status: "Resolved",
    description: "System file modification detected in Windows directory",
    processName: "svchost.exe",
    affectedFile: "C:\\Windows\\System32\\drivers\\etc\\hosts",
    analysis: "Legitimate Windows Update process modified hosts file. Verified digital signature and update rollback capability",
  },
  {
    id: "INC-005",
    timestamp: "2025-10-07 12:30:55",
    type: "Data Exfiltration",
    source: "192.168.1.42",
    severity: "Critical",
    status: "Investigating",
    description: "Large volume of sensitive data accessed and transferred",
    processName: "outlook.exe",
    analysis: "Employee account compromised. Detected unauthorized access to financial documents with immediate export to external email",
  },
];

// Mock user actions
export const mockUserActions: UserAction[] = [
  {
    id: "ACT-001",
    timestamp: "2025-10-07 14:35:22",
    username: "analyst.john",
    action: "Acknowledged incident INC-001",
    incidentId: "INC-001",
    type: "incident",
  },
  {
    id: "ACT-002",
    timestamp: "2025-10-07 14:30:15",
    username: "analyst.sarah",
    action: "Updated detection rule: Malware Signatures v2.1",
    type: "rule",
  },
  {
    id: "ACT-003",
    timestamp: "2025-10-07 14:25:40",
    username: "analyst.mike",
    action: "Resolved incident INC-004",
    incidentId: "INC-004",
    type: "incident",
  },
  {
    id: "ACT-004",
    timestamp: "2025-10-07 14:18:33",
    username: "analyst.john",
    action: "Started investigation on INC-002",
    incidentId: "INC-002",
    type: "incident",
  },
  {
    id: "ACT-005",
    timestamp: "2025-10-07 14:10:12",
    username: "admin.alex",
    action: "Modified CPU threshold alert to 85%",
    type: "system",
  },
  {
    id: "ACT-006",
    timestamp: "2025-10-07 14:05:55",
    username: "analyst.sarah",
    action: "Exported security report for week 40",
    type: "system",
  },
  {
    id: "ACT-007",
    timestamp: "2025-10-07 13:58:30",
    username: "analyst.mike",
    action: "Acknowledged incident INC-003",
    incidentId: "INC-003",
    type: "incident",
  },
];

// Mock incident timeline
export const mockIncidentTimeline: Record<string, TimelineStage[]> = {
  "INC-001": [
    {
      stage: "Detection",
      timestamp: "2025-10-07 14:32:15",
      status: "completed",
      description: "Malicious executable detected by EDR sensor",
      analyst: "System",
    },
    {
      stage: "Analysis",
      timestamp: "2025-10-07 14:33:22",
      status: "completed",
      description: "Hash matched with VirusTotal database",
      analyst: "analyst.john",
    },
    {
      stage: "Containment",
      timestamp: "2025-10-07 14:35:45",
      status: "in-progress",
      description: "Isolating affected host from network",
      analyst: "analyst.john",
    },
    {
      stage: "Eradication",
      timestamp: "2025-10-07 14:40:00",
      status: "pending",
      description: "Remove malware and restore system",
      analyst: "Pending",
    },
    {
      stage: "Recovery",
      timestamp: "2025-10-07 15:00:00",
      status: "pending",
      description: "Restore normal operations",
      analyst: "Pending",
    },
  ],
  "INC-002": [
    {
      stage: "Detection",
      timestamp: "2025-10-07 14:15:42",
      status: "completed",
      description: "Privilege escalation attempt detected",
      analyst: "System",
    },
    {
      stage: "Analysis",
      timestamp: "2025-10-07 14:18:30",
      status: "in-progress",
      description: "Analyzing token manipulation technique",
      analyst: "analyst.john",
    },
    {
      stage: "Containment",
      timestamp: "",
      status: "pending",
      description: "Awaiting analysis completion",
      analyst: "Pending",
    },
    {
      stage: "Eradication",
      timestamp: "",
      status: "pending",
      description: "Remove threat and patch vulnerability",
      analyst: "Pending",
    },
    {
      stage: "Recovery",
      timestamp: "",
      status: "pending",
      description: "Restore normal operations",
      analyst: "Pending",
    },
  ],
  "INC-004": [
    {
      stage: "Detection",
      timestamp: "2025-10-07 13:45:10",
      status: "completed",
      description: "File integrity change detected",
      analyst: "System",
    },
    {
      stage: "Analysis",
      timestamp: "2025-10-07 13:48:20",
      status: "completed",
      description: "Verified legitimate Windows Update",
      analyst: "analyst.mike",
    },
    {
      stage: "Containment",
      timestamp: "2025-10-07 13:50:00",
      status: "completed",
      description: "No containment required",
      analyst: "analyst.mike",
    },
    {
      stage: "Eradication",
      timestamp: "2025-10-07 13:50:00",
      status: "completed",
      description: "No eradication required",
      analyst: "analyst.mike",
    },
    {
      stage: "Recovery",
      timestamp: "2025-10-07 13:50:30",
      status: "completed",
      description: "System operating normally",
      analyst: "analyst.mike",
    },
  ],
};

// Mock process tree
export const mockProcessTree: Record<string, ProcessNode> = {
  "INC-001": {
    name: "explorer.exe",
    pid: "2048",
    status: "normal",
    children: [
      {
        name: "chrome.exe",
        pid: "3456",
        status: "normal",
        children: [
          {
            name: "malware.exe",
            pid: "7890",
            status: "malicious",
            children: [
              {
                name: "cmd.exe",
                pid: "8901",
                status: "suspicious",
              },
              {
                name: "powershell.exe",
                pid: "8902",
                status: "suspicious",
              },
            ],
          },
        ],
      },
    ],
  },
  "INC-002": {
    name: "services.exe",
    pid: "624",
    status: "normal",
    children: [
      {
        name: "svchost.exe",
        pid: "1820",
        status: "normal",
        children: [
          {
            name: "cmd.exe",
            pid: "5432",
            status: "suspicious",
            children: [
              {
                name: "token_stealer.exe",
                pid: "6543",
                status: "malicious",
              },
            ],
          },
        ],
      },
    ],
  },
};

// Simulate real-time incident generation
export const generateRandomIncident = (): Incident => {
  const types = ["Malware Detection", "Privilege Escalation", "Network Anomaly", "File Integrity", "Data Exfiltration"];
  const severities: ("Critical" | "High" | "Medium" | "Low")[] = ["Critical", "High", "Medium", "Low"];
  const sources = ["192.168.1.105", "192.168.1.87", "WORKSTATION-02", "SERVER-01", "192.168.1.42"];
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  
  return {
    id: `INC-${String(Math.floor(Math.random() * 9999)).padStart(3, "0")}`,
    timestamp: new Date().toLocaleString("en-US", { 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit", 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: false 
    }),
    type: randomType,
    source: randomSource,
    severity: randomSeverity,
    status: "Active",
    description: `New ${randomType.toLowerCase()} detected`,
  };
};
