import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, Shield, AlertTriangle, Download, CheckCircle2, FileSearch } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <FileSearch className="h-8 w-8 text-primary" />
          Host Scan & Baseline Integrity
        </h1>
        <p className="text-muted-foreground">
          Scan hosts for baseline deviations, file changes, and suspicious modifications
        </p>
      </motion.div>

      {/* Scan Control */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-primary/20 shadow-lg backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Start Host Scan
            </CardTitle>
            <CardDescription>Enter a hostname or IP address to scan for integrity changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter host ID (e.g., WIN-SRV-01)"
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                className="flex-1 border-muted-foreground/20 focus:border-primary transition-colors"
                disabled={scanning}
              />
              <Button 
                onClick={handleStartScan} 
                disabled={scanning || !hostId}
                size="lg"
                className="min-w-[180px] transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Start Full Scan
                  </>
                )}
              </Button>
            </div>
            {scanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scanning system files...</span>
                  <span className="text-primary font-medium">In Progress</span>
                </div>
                <Progress value={65} className="h-2" indicatorClassName="bg-gradient-to-r from-primary to-purple-600" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scan Summary */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/95">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Baseline Match</CardTitle>
                    <Shield className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {scanResult.baseline_score}%
                    </div>
                    <Progress 
                      value={scanResult.baseline_score} 
                      className="mt-3 h-2" 
                      indicatorClassName={cn(
                        "transition-all",
                        scanResult.baseline_score > 90 ? "bg-green-500" : 
                        scanResult.baseline_score > 70 ? "bg-yellow-500" : "bg-red-500"
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      {scanResult.baseline_score > 90 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Excellent integrity
                        </>
                      ) : scanResult.baseline_score > 70 ? (
                        <>
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Good integrity
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Poor integrity
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-warning/20 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/95">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Changes Detected</CardTitle>
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-warning">{scanResult.changes.length}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Files, registry keys, and services
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={cn(
                  "shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/95",
                  scanResult.severity === "high" ? "border-critical/20" : "border-warning/20"
                )}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={cn("text-sm px-3 py-1", getSeverityColor(scanResult.severity))}>
                      {scanResult.severity.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-3">
                      Last scan: {new Date(scanResult.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Changes Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-muted/20 shadow-lg backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Detected Changes
                      </CardTitle>
                      <CardDescription>Files, registry keys, and configuration modifications</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="hover:bg-muted/50 transition-colors">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                      <Button size="sm" variant="destructive" className="hover:shadow-md transition-all">
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
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.05 }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <Badge variant="outline" className="border-primary/30">
                              {change.path ? "File" : "Registry"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {change.path || change.reg_key}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={change.change === "new" ? "destructive" : "default"}
                              className={cn(
                                "transition-all",
                                change.change === "modified" && "bg-warning text-warning-foreground"
                              )}
                            >
                              {change.change}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {change.hash || "—"}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
