import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const detectionModules = [
  { id: "process", name: "Process Monitoring", description: "Monitor process creation and execution" },
  { id: "network", name: "Network Monitoring", description: "Track network connections and traffic" },
  { id: "file", name: "File Integrity", description: "Monitor file system changes" },
  { id: "registry", name: "Registry Monitoring", description: "Track Windows registry modifications" },
  { id: "privilege", name: "Privilege Escalation", description: "Detect unauthorized privilege changes" },
];

const Rules = () => {
  const handleSave = () => {
    toast.success("Configuration saved successfully");
  };

  const handleReset = () => {
    toast.info("Configuration reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rules & Settings</h1>
        <p className="text-muted-foreground">Configure detection rules and monitoring modules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detection Modules</CardTitle>
          <CardDescription>Enable or disable specific monitoring modules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {detectionModules.map((module) => (
            <div key={module.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="space-y-1">
                <p className="font-medium text-foreground">{module.name}</p>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>Configure sensitivity levels for different alert types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpu-threshold">CPU Usage Alert (%)</Label>
              <Input id="cpu-threshold" type="number" defaultValue="80" className="bg-card border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory-threshold">Memory Usage Alert (%)</Label>
              <Input id="memory-threshold" type="number" defaultValue="85" className="bg-card border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="network-threshold">Network Traffic Alert (MB/s)</Label>
              <Input id="network-threshold" type="number" defaultValue="100" className="bg-card border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="failed-logins">Failed Login Attempts</Label>
              <Input id="failed-logins" type="number" defaultValue="5" className="bg-card border-border" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default Rules;
