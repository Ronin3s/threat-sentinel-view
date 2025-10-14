import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Play, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { getPlaybooks, executePlaybook, Playbook } from "@/api/apiClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    const data = await getPlaybooks();
    setPlaybooks(data);
  };

  const handleExecute = async (playbookId: string, playbookName: string) => {
    setExecuting(playbookId);
    
    try {
      toast.info(`Executing playbook: ${playbookName}`);
      const results = await executePlaybook("inc-demo", playbookId);
      setExecutionResults(results);
      setShowResults(true);
      setExecuting(null);
      toast.success("Playbook execution completed");
    } catch (error) {
      toast.error("Playbook execution failed");
      setExecuting(null);
    }
  };

  const handleToggle = (id: string) => {
    setPlaybooks(prev =>
      prev.map(pb => pb.id === id ? { ...pb, enabled: !pb.enabled } : pb)
    );
    toast.success("Playbook status updated");
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "full-auto":
        return "bg-critical/20 text-critical border-critical";
      case "semi-auto":
        return "bg-warning/20 text-warning border-warning";
      case "suggest":
        return "bg-info/20 text-info border-info";
      default:
        return "";
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "full-auto":
        return "Full Auto";
      case "semi-auto":
        return "Semi-Auto";
      case "suggest":
        return "Suggest Only";
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Auto-Containment Playbooks</h1>
          <p className="text-muted-foreground">
            Automated response workflows for common security incidents
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Playbook
        </Button>
      </div>

      {/* Playbooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Playbooks</CardTitle>
          <CardDescription>Manage automated response workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger Conditions</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playbooks.map((playbook) => (
                <TableRow key={playbook.id}>
                  <TableCell className="font-medium">{playbook.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {playbook.trigger}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {playbook.actions.slice(0, 2).map((action, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {action.action.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {playbook.actions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{playbook.actions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(getModeColor(playbook.mode))}>
                      {getModeLabel(playbook.mode)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={playbook.enabled}
                        onCheckedChange={() => handleToggle(playbook.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {playbook.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleExecute(playbook.id, playbook.name)}
                        disabled={executing === playbook.id || !playbook.enabled}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {executing === playbook.id ? "Running..." : "Execute"}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-critical" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Execution Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Playbook Execution Results</DialogTitle>
            <DialogDescription>
              Execution ID: {executionResults?.execution_id}
            </DialogDescription>
          </DialogHeader>
          
          {executionResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={executionResults.status === "completed" ? "default" : "destructive"}
                  className="text-sm"
                >
                  {executionResults.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Action Results</h4>
                {executionResults.results.map((result: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {result.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-critical mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{result.action.replace(/_/g, " ")}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                        <Badge variant={result.status === "success" ? "default" : "destructive"}>
                          {result.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
