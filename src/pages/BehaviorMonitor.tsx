import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Skull, Trash2, Download, GitBranch } from "lucide-react";
import { useBehaviorStream } from "@/hooks/useBehaviorStream";
import { killProcess, collectEvidence, isolateHost } from "@/api/apiClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcessTree } from "@/components/incidents/ProcessTree";
import { mockProcessTree } from "@/lib/mockData";

export default function BehaviorMonitor() {
  const { events, isConnected, clearEvents } = useBehaviorStream();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleKillProcess = async (host: string, pid: number) => {
    try {
      await killProcess(host, pid);
      toast.success(`Process ${pid} terminated on ${host}`);
    } catch (error) {
      toast.error("Failed to kill process");
    }
  };

  const handleCollectEvidence = async (host: string) => {
    try {
      const result = await collectEvidence(host, "memory_dump");
      toast.success(`Evidence collected: ${result.evidence_id}`);
    } catch (error) {
      toast.error("Failed to collect evidence");
    }
  };

  const handleIsolateHost = async (host: string) => {
    try {
      await isolateHost(host);
      toast.success(`Host ${host} isolated from network`);
    } catch (error) {
      toast.error("Failed to isolate host");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-critical text-critical-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-info text-info-foreground";
      default:
        return "";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "border-critical/50 bg-critical/20 text-critical";
      case "medium":
        return "border-warning/50 bg-warning/20 text-warning";
      default:
        return "border-muted bg-muted/20";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Runtime Behavioral Monitor</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of suspicious process behaviors and system activities
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Telemetry Stream</CardTitle>
              <CardDescription>Live behavioral events from monitored endpoints</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-success animate-pulse" : "bg-muted")}>
                </div>
                <span className="text-sm text-muted-foreground">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={clearEvents}>
                Clear Events
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Skull className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">
              {events.filter(e => e.severity === "high").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {events.filter(e => e.severity === "medium").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(events.map(e => e.host)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavior Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Events</CardTitle>
          <CardDescription>Real-time feed of suspicious process activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Process</TableHead>
                  <TableHead>PID</TableHead>
                  <TableHead>Behaviors</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Waiting for behavioral events...
                    </TableCell>
                  </TableRow>
                ) : (
                  events.slice(0, 50).map((event) => (
                    <TableRow key={event.event_id}>
                      <TableCell className="text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{event.host}</TableCell>
                      <TableCell className="font-mono text-sm">{event.process}</TableCell>
                      <TableCell className="font-mono text-sm">{event.pid}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {event.behavior.map((b: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {b.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-medium", getSeverityColor(event.severity))}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", getConfidenceColor(event.confidence))}>
                          {event.confidence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                            title="View Process Tree"
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleKillProcess(event.host, event.pid)}
                            title="Kill Process"
                          >
                            <Trash2 className="h-4 w-4 text-critical" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCollectEvidence(event.host)}
                            title="Collect Evidence"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Process Tree Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Process Tree</DialogTitle>
            <DialogDescription>
              Process hierarchy for {selectedEvent?.process} (PID: {selectedEvent?.pid})
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <ProcessTree rootProcess={mockProcessTree["INC-001"]} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
