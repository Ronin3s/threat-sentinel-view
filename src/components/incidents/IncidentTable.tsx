import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { IncidentDetailModal } from "./IncidentDetailModal";
import { cn } from "@/lib/utils";

export interface Incident {
  id: string;
  timestamp: string;
  type: string;
  source: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Active" | "Investigating" | "Resolved";
  description: string;
  processName?: string;
  affectedFile?: string;
  analysis?: string;
}

const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    timestamp: "2025-10-07 14:32:15",
    type: "Malware Detection",
    source: "192.168.1.105",
    severity: "Critical",
    status: "Active",
    description: "Suspicious executable detected",
    processName: "malware.exe",
    affectedFile: "C:\\Users\\Admin\\Downloads\\malware.exe",
    analysis: "MD5 hash matches known malware signature in VirusTotal database",
  },
  {
    id: "INC-002",
    timestamp: "2025-10-07 14:15:42",
    type: "Privilege Escalation",
    source: "WORKSTATION-02",
    severity: "High",
    status: "Investigating",
    description: "Unauthorized privilege escalation attempt",
    processName: "cmd.exe",
    analysis: "Process attempted to gain SYSTEM level privileges",
  },
  {
    id: "INC-003",
    timestamp: "2025-10-07 13:58:22",
    type: "Network Anomaly",
    source: "192.168.1.87",
    severity: "Medium",
    status: "Active",
    description: "Unusual outbound traffic detected",
  },
  {
    id: "INC-004",
    timestamp: "2025-10-07 13:45:10",
    type: "File Integrity",
    source: "SERVER-01",
    severity: "Low",
    status: "Resolved",
    description: "System file modification detected",
  },
];

export const IncidentTable = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-critical text-critical-foreground";
      case "High":
        return "bg-warning text-warning-foreground";
      case "Medium":
        return "bg-info text-info-foreground";
      case "Low":
        return "bg-success text-success-foreground";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-critical/20 text-critical border-critical/50";
      case "Investigating":
        return "bg-warning/20 text-warning border-warning/50";
      case "Resolved":
        return "bg-success/20 text-success border-success/50";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Source</TableHead>
              <TableHead className="text-muted-foreground">Severity</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockIncidents.map((incident) => (
              <TableRow key={incident.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-foreground">{incident.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{incident.timestamp}</TableCell>
                <TableCell className="text-sm text-foreground">{incident.type}</TableCell>
                <TableCell className="font-mono text-sm text-foreground">{incident.source}</TableCell>
                <TableCell>
                  <Badge className={cn("font-medium", getSeverityColor(incident.severity))}>
                    {incident.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-medium", getStatusColor(incident.status))}>
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIncident(incident)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <IncidentDetailModal
        incident={selectedIncident}
        open={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </>
  );
};
