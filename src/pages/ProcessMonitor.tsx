import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  RefreshCw,
  Activity,
  AlertTriangle,
  Cpu,
  MemoryStick,
  XCircle,
  Shield,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import sirenApi, { Process, SystemMetrics } from '@/lib/api';

interface ProcessData {
  processes: Process[];
}

export default function ProcessMonitor() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [killingPid, setKillingPid] = useState<number | null>(null);

  const fetchProcesses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await sirenApi.process.getProcesses();
      setProcesses(data.processes || []);
      toast.success(`Loaded ${data.processes?.length || 0} processes`);
    } catch (error) {
      console.error('Failed to fetch processes:', error);
      toast.error('Failed to fetch process data');
      setProcesses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await sirenApi.process.getMetrics();
      setMetrics(data.history || []);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setMetrics([]);
    }
  };

  const killProcess = async (pid: number, name: string) => {
    setKillingPid(pid);
    try {
      await sirenApi.process.killProcess(pid);
      toast.success(`Successfully killed process: ${name} (PID: ${pid})`);
      // Refresh process list after kill
      await fetchProcesses(true);
    } catch (error) {
      console.error('Failed to kill process:', error);
      toast.error(`Failed to kill process: ${name}`);
    } finally {
      setKillingPid(null);
    }
  };

  useEffect(() => {
    // Auto-refresh processes every 5 seconds
    const interval = setInterval(() => {
      if (!loading && !refreshing && !killingPid) {
        fetchProcesses(true);
        fetchMetrics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, refreshing, killingPid]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'secondary';
    return 'outline';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  // Calculate summary stats
  const summary = {
    total: processes.length,
    highRisk: processes.filter(p => p.risk_score >= 70).length,
    cpu: processes.reduce((sum, p) => sum + p.cpu_percent, 0),
    memory: processes.reduce((sum, p) => sum + p.memory_percent, 0),
  };

  // Prepare chart data from metrics
  const cpuChartData = metrics.map((m, idx) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    usage: m.cpu_percent
  }));

  const memoryChartData = metrics.map((m, idx) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    usage: m.memory_percent
  }));

  const currentMetric = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Process Monitor</h1>
          <p className="text-muted-foreground">Real-time process monitoring with risk assessment</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchProcesses()}
            disabled={loading}
            variant="default"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Load Processes
          </Button>
          <Button
            onClick={() => {
              fetchProcesses(true);
              fetchMetrics();
            }}
            disabled={refreshing || loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{summary.highRisk}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetric ? `${currentMetric.cpu_percent.toFixed(1)}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetric ? `${currentMetric.memory_percent.toFixed(1)}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {metrics.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>CPU Usage</CardTitle>
              <CardDescription>Last 60 seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cpuChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip />
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

          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
              <CardDescription>Last 60 seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={memoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Process Table */}
      <Card>
        <CardHeader>
          <CardTitle>Running Processes</CardTitle>
          <CardDescription>
            {processes.length > 0
              ? `Showing ${processes.length} processes`
              : 'Click "Load Processes" to fetch data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : processes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Shield className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No process data loaded</p>
              <p className="text-sm">Click "Load Processes" to fetch data from the backend</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PID</TableHead>
                    <TableHead>Process Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>CPU %</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {processes.map((process) => (
                      <motion.tr
                        key={process.pid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b"
                      >
                        <TableCell className="font-mono text-sm">{process.pid}</TableCell>
                        <TableCell className="font-medium">{process.name}</TableCell>
                        <TableCell className="text-sm">{process.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{process.cpu_percent.toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{process.memory_mb.toFixed(0)} MB</div>
                            <div className="text-xs text-muted-foreground">
                              {process.memory_percent.toFixed(1)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(process.risk_score)}>
                            <span className={getRiskColor(process.risk_score)}>
                              {getRiskLabel(process.risk_score)} ({process.risk_score})
                            </span>
                          </Badge>
                          {process.risk_reason && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {process.risk_reason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{process.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => killProcess(process.pid, process.name)}
                            disabled={killingPid === process.pid}
                            className="gap-1"
                          >
                            {killingPid === process.pid ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Kill
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
