import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Activity, TrendingUp, RefreshCw, Server } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { IncidentChart } from '@/components/dashboard/IncidentChart';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { Button } from '@/components/ui/button';
import sirenApi from '@/lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    criticalAlerts: 0,
  });
  const [services, setServices] = useState<any>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch data from multiple services
      const [healthData, incidentsData, behaviorStats, containmentStats] = await Promise.all([
        sirenApi.global.getHealth().catch(() => null),
        sirenApi.report.listIncidents().catch(() => ({ incidents: [], count: 0 })),
        sirenApi.behavior.getStatistics().catch(() => null),
        sirenApi.containment.getStatistics().catch(() => null),
      ]);

      setServices(healthData?.services || null);

      // Calculate stats from real data
      const incidents = incidentsData.incidents || [];
      const activeIncidents = incidents.filter((inc: any) =>
        inc.status === 'investigating' || inc.status === 'active'
      ).length;

      const resolvedToday = incidents.filter((inc: any) => {
        if (!inc.created_at) return false;
        const createdDate = new Date(inc.created_at);
        const today = new Date();
        return createdDate.toDateString() === today.toDateString() && inc.status === 'resolved';
      }).length;

      const highSeverityEvents = behaviorStats?.by_severity?.high || 0;

      setStats({
        totalIncidents: incidents.length,
        activeIncidents,
        resolvedToday,
        criticalAlerts: highSeverityEvents,
      });

      toast.success('Dashboard data loaded');
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and incident overview</p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Incidents"
          value={stats.totalIncidents.toString()}
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Active Incidents"
          value={stats.activeIncidents.toString()}
          icon={AlertTriangle}
          variant={stats.activeIncidents > 0 ? 'critical' : 'default'}
        />
        <StatCard
          title="Resolved Today"
          value={stats.resolvedToday.toString()}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlerts.toString()}
          icon={TrendingUp}
          variant={stats.criticalAlerts > 5 ? 'warning' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncidentChart />
        </div>
        <div>
          <SystemStatus services={services} onRefresh={loadDashboardData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
