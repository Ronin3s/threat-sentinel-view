import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, AlertTriangle, Shield } from "lucide-react";
import { ProcessNode } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface ProcessTreeProps {
  rootProcess: ProcessNode;
}

const ProcessNodeComponent = ({ node, level = 0 }: { node: ProcessNode; level?: number }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "malicious":
        return <AlertTriangle className="h-4 w-4 text-critical" />;
      case "suspicious":
        return <Shield className="h-4 w-4 text-warning" />;
      default:
        return <Terminal className="h-4 w-4 text-success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "malicious":
        return "border-critical bg-critical/10 text-critical";
      case "suspicious":
        return "border-warning bg-warning/10 text-warning";
      default:
        return "border-success bg-success/10 text-success";
    }
  };

  return (
    <div className={cn("space-y-2", level > 0 && "ml-8")}>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        {getStatusIcon(node.status)}
        <div className="flex-1">
          <p className="font-mono text-sm font-medium text-foreground">{node.name}</p>
          <p className="text-xs text-muted-foreground">PID: {node.pid}</p>
        </div>
        <Badge variant="outline" className={cn("text-xs", getStatusColor(node.status))}>
          {node.status}
        </Badge>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-2">
            {node.children.map((child, index) => (
              <div key={`${child.pid}-${index}`} className="relative">
                {/* Horizontal connector */}
                <div className="absolute -left-4 top-6 h-0.5 w-4 bg-border" />
                <ProcessNodeComponent node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProcessTree = ({ rootProcess }: ProcessTreeProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Process Execution Tree</CardTitle>
      </CardHeader>
      <CardContent>
        <ProcessNodeComponent node={rootProcess} />
      </CardContent>
    </Card>
  );
};
