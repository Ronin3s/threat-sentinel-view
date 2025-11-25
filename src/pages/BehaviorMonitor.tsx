import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Shield,
  Play,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import sirenApi, { BehaviorEvent } from '@/lib/api';

export default function BehaviorMonitor() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [stats, setStats] = useState({
    total_events: 0,
    by_severity: { low: 0, medium: 0, high: 0 },
    unique_hosts: 0,
    unique_processes: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await sirenApi.behavior.getEvents(50);
      setEvents(data.events || []);
      toast.success(`Loaded ${data.count} events`);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load behavioral events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await sirenApi.behavior.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const simulateEvents = async () => {
    setRefreshing(true);
    try {
      await sirenApi.behavior.simulateEvents(10);
      toast.success('Generated 10 test events');
      await loadEvents();
      await loadStatistics();
    } catch (error) {
      console.error('Failed to simulate events:', error);
      toast.error('Failed to generate test events');
    } finally {
      setRefreshing(false);
    }
  };

  const clearEvents = async () => {
    try {
      await sirenApi.behavior.clearEvents();
      toast.success('All events cleared');
      setEvents([]);
      await loadStatistics();
    } catch (error) {
      console.error('Failed to clear events:', error);
      toast.error('Failed to clear events');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadEvents(), loadStatistics()]);
      toast.success('Data refreshed');
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        loadStatistics();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, refreshing]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getSeverityBadge = (severity: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Behavior Monitor</h1>
          <p className="text-muted-foreground">Real-time behavioral anomaly detection</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadEvents}
            disabled={loading}
            variant="default"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Load Events
          </Button>
          <Button
            onClick={simulateEvents}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Simulate Events
          </Button>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={clearEvents}
            variant="destructive"
            size="icon"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_events}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.by_severity.high}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Hosts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unique_hosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Processes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unique_processes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Events</CardTitle>
          <CardDescription>
            {events.length > 0
              ? `Showing ${events.length} recent events`
              : 'Click "Load Events" to fetch data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Shield className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No events loaded</p>
              <p className="text-sm">Click "Load Events" or "Simulate Events" to see data</p>
            </div>
          ) : (
            <div className="rounded-md border">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {events.map((event) => (
                      <motion.tr
                        key={event.event_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b"
                      >
                        <TableCell className="font-mono text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.host}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{event.process}</TableCell>
                        <TableCell className="font-mono text-sm">{event.pid}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {event.behavior.map((b, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {b.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityBadge(event.severity)}>
                            <span className={getSeverityColor(event.severity)}>
                              {event.severity.toUpperCase()}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.confidence}</Badge>
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
