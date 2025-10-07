import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

const cpuData = [
  { time: "00:00", value: 45 },
  { time: "04:00", value: 38 },
  { time: "08:00", value: 62 },
  { time: "12:00", value: 58 },
  { time: "16:00", value: 72 },
  { time: "20:00", value: 51 },
];

const memoryData = [
  { time: "00:00", value: 52 },
  { time: "04:00", value: 48 },
  { time: "08:00", value: 68 },
  { time: "12:00", value: 75 },
  { time: "16:00", value: 82 },
  { time: "20:00", value: 67 },
];

const processActivity = [
  { name: "system.exe", pid: "1234", parent: "services.exe", status: "normal" },
  { name: "chrome.exe", pid: "5678", parent: "explorer.exe", status: "normal" },
  { name: "svchost.exe", pid: "9012", parent: "services.exe", status: "normal" },
  { name: "suspicious.exe", pid: "3456", parent: "unknown", status: "suspicious" },
  { name: "powershell.exe", pid: "7890", parent: "cmd.exe", status: "monitoring" },
];

const Monitoring = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Monitoring</h1>
        <p className="text-muted-foreground">Real-time system resource and process monitoring</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Process Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {processActivity.map((process) => (
              <div
                key={process.pid}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground">{process.name}</p>
                    <p className="text-xs text-muted-foreground">
                      PID: {process.pid} | Parent: {process.parent}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    process.status === "suspicious"
                      ? "border-critical/50 bg-critical/10 text-critical"
                      : process.status === "monitoring"
                      ? "border-warning/50 bg-warning/10 text-warning"
                      : "border-success/50 bg-success/10 text-success"
                  }
                >
                  {process.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Monitoring;
