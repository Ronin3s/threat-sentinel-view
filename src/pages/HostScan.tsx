import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, Shield, AlertTriangle, Download } from "lucide-react";
import { startHostScan, getScanJob, ScanJob } from "@/api/apiClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HostScan() {
  const [hostId, setHostId] = useState("WIN-SRV-01");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanJob | null>(null);

  const handleStartScan = async () => {
    setScanning(true);
    setScanResult(null);
    
    try {
      const { jobId } = await startHostScan(hostId);
      toast.info(`Scan started: ${jobId}`);
      
      // Poll for scan results
      setTimeout(async () => {
        const result = await getScanJob(jobId);
        setScanResult(result);
        setScanning(false);
        
        if (result.severity === "high") {
          toast.error("High severity changes detected!");
        } else {
          toast.success("Scan completed successfully");
        }
      }, 3000);
    } catch (error) {
      toast.error("Failed to start scan");
      setScanning(false);
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
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Host Scan & Baseline Integrity</h1>
        <p className="text-muted-foreground">
          Scan hosts for baseline deviations, file changes, and suspicious modifications
        </p>
      </div>

      {/* Scan Control */}
      <Card>
        <CardHeader>
          <CardTitle>Start Host Scan</CardTitle>
          <CardDescription>Enter a hostname or IP address to scan for integrity changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter host ID (e.g., WIN-SRV-01)"
              value={hostId}
              onChange={(e) => setHostId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleStartScan} disabled={scanning || !hostId}>
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Start Full Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Summary */}
      {scanResult && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Baseline Match</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scanResult.baseline_score}%</div>
                <Progress value={scanResult.baseline_score} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {scanResult.baseline_score > 90 ? "Excellent" : scanResult.baseline_score > 70 ? "Good" : "Poor"} integrity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Changes Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scanResult.changes.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Files, registry keys, and services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={cn("text-sm", getSeverityColor(scanResult.severity))}>
                  {scanResult.severity.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Last scan: {new Date(scanResult.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Changes Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detected Changes</CardTitle>
                  <CardDescription>Files, registry keys, and configuration modifications</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button size="sm" variant="destructive">
                    Create Incident
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Hash/Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResult.changes.map((change, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant="outline">
                          {change.path ? "File" : "Registry"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {change.path || change.reg_key}
                      </TableCell>
                      <TableCell>
                        <Badge variant={change.change === "new" ? "destructive" : "default"}>
                          {change.change}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {change.hash || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
