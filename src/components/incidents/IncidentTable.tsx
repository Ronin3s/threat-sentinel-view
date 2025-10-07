import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { IncidentDetailModal } from "./IncidentDetailModal";
import { cn } from "@/lib/utils";
import { mockIncidents } from "@/lib/mockData";

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

interface IncidentTableProps {
  onIncidentSelect?: (incident: Incident) => void;
}

export const IncidentTable = ({ onIncidentSelect }: IncidentTableProps) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    onIncidentSelect?.(incident);
  };

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
            {incidents.map((incident) => (
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
                    onClick={() => handleIncidentClick(incident)}
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
