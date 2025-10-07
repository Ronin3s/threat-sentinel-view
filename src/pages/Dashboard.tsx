import { AlertTriangle, CheckCircle, Activity, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncidentChart } from "@/components/dashboard/IncidentChart";
import { SystemStatus } from "@/components/dashboard/SystemStatus";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring and incident overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Incidents"
          value="247"
          icon={Activity}
          trend={{ value: "+12% from last week", isPositive: false }}
          variant="default"
        />
        <StatCard
          title="Active Incidents"
          value="18"
          icon={AlertTriangle}
          trend={{ value: "+3 in last hour", isPositive: false }}
          variant="critical"
        />
        <StatCard
          title="Resolved Today"
          value="42"
          icon={CheckCircle}
          trend={{ value: "+8% from yesterday", isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Critical Alerts"
          value="5"
          icon={TrendingUp}
          trend={{ value: "-2 from yesterday", isPositive: true }}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncidentChart />
        </div>
        <div>
          <SystemStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
