import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, Network } from "lucide-react";

const systemMetrics = [
  { name: "CPU Usage", value: 45, icon: Cpu, status: "normal" },
  { name: "Memory Usage", value: 67, icon: HardDrive, status: "warning" },
  { name: "Network Traffic", value: 32, icon: Network, status: "normal" },
];

export const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{metric.name}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{metric.value}%</span>
            </div>
            <Progress 
              value={metric.value} 
              className="h-2"
              indicatorClassName={
                metric.value > 80 ? "bg-critical" : 
                metric.value > 60 ? "bg-warning" : 
                "bg-success"
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
