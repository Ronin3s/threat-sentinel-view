import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  MemoryStick, 
  XCircle,
  TrendingUp,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Process {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  risk: "Low" | "Medium" | "High";
  status: string;
}

interface ProcessData {
  processes: Process[];
  summary: {
    total: number;
    highRisk: number;
    systemLoad: number;
  };
}

interface MetricData {
  cpu: Array<{ time: string; usage: number }>;
  memory: Array<{ time: string; usage: number }>;
}

export default function ProcessMonitor() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [killingPid, setKillingPid] = useState<number | null>(null);

  const fetchProcesses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/monitor/processes");
      const data = await response.json();
      setProcessData(data);
    } catch (error) {
      toast.error("Failed to fetch process data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/monitor/metrics");
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
  };

  useEffect(() => {
    fetchProcesses();
    fetchMetrics();

    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchProcesses(true);
      fetchMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleKillProcess = async (pid: number, name: string) => {
    setKillingPid(pid);
    
    try {
      const response = await fetch(`http://localhost:4000/api/monitor/kill/${pid}`, {
        method: "POST"
      });
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success(data.message, {
          description: "Process terminated successfully",
          icon: "🔴"
        });
        await fetchProcesses(true);
      } else {
        toast.error("Failed to terminate process");
      }
    } catch (error) {
      toast.error(`Failed to kill process ${name}`);
    } finally {
      setKillingPid(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-critical text-critical-foreground hover:bg-critical/90";
      case "Medium":
        return "bg-warning text-warning-foreground hover:bg-warning/90";
      case "Low":
        return "bg-success text-success-foreground hover:bg-success/90";
      default:
        return "bg-muted";
    }
  };

  const getRiskIndicator = (risk: string) => {
    switch (risk) {
      case "High":
        return "🔴";
      case "Medium":
        return "🟡";
      case "Low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Behavior Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time process monitoring and system behavior analysis
          </p>
        </div>
        <Button
          onClick={() => fetchProcesses(true)}
          disabled={refreshing}
          size="lg"
          className="min-w-[140px]"
        >
          <RefreshCw className={cn("mr-2 h-5 w-5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-muted/20">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card className="border-primary/20 shadow-lg backdrop-blur-sm bg-card/95 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
              <Shield className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{processData?.summary.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active processes running</p>
            </CardContent>
          </Card>

          <Card className="border-critical/20 shadow-lg backdrop-blur-sm bg-card/95 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-5 w-5 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-critical">
                {processData?.summary.highRisk || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Suspicious processes detected</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 shadow-lg backdrop-blur-sm bg-card/95 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Load</CardTitle>
              <TrendingUp className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {processData?.summary.systemLoad || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall system utilization</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/20 shadow-lg backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  CPU Usage
                </CardTitle>
                <CardDescription>Last 60 seconds</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics.cpu}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-info/20 shadow-lg backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5 text-info" />
                  Memory Usage
                </CardTitle>
                <CardDescription>Last 60 seconds</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics.memory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="hsl(var(--info))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Process Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-muted/20 shadow-lg backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Running Processes
            </CardTitle>
            <CardDescription>Real-time process monitoring with risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PID</TableHead>
                    <TableHead>Process Name</TableHead>
                    <TableHead>CPU Usage</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {processData?.processes.map((process, idx) => (
                      <motion.tr
                        key={process.pid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm">{process.pid}</TableCell>
                        <TableCell className="font-medium">{process.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{process.cpu}%</div>
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full transition-all",
                                  process.cpu > 50 ? "bg-critical" : process.cpu > 25 ? "bg-warning" : "bg-success"
                                )}
                                style={{ width: `${Math.min(process.cpu, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{process.mem} MB</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", getRiskColor(process.risk))}>
                            <span className="mr-1">{getRiskIndicator(process.risk)}</span>
                            {process.risk}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleKillProcess(process.pid, process.name)}
                            disabled={killingPid === process.pid}
                            className="hover:shadow-md transition-all"
                          >
                            {killingPid === process.pid ? (
                              <>
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                Killing...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1 h-3 w-3" />
                                Kill
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
