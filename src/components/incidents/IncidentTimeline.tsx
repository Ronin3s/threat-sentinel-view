import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { TimelineStage } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface IncidentTimelineProps {
  stages: TimelineStage[];
}

export const IncidentTimeline = ({ stages }: IncidentTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-warning animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-success bg-success/10 text-success";
      case "in-progress":
        return "border-warning bg-warning/10 text-warning";
      default:
        return "border-muted bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Incident Lifecycle Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.stage} className="relative">
              {/* Connecting line */}
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[10px] top-[32px] h-[calc(100%+16px)] w-0.5",
                    stage.status === "completed" ? "bg-success" : "bg-border"
                  )}
                />
              )}

              {/* Timeline item */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  {getStatusIcon(stage.status)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{stage.stage}</h4>
                    <Badge variant="outline" className={cn("text-xs", getStatusColor(stage.status))}>
                      {stage.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{stage.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {stage.timestamp && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stage.timestamp}
                      </span>
                    )}
                    {stage.analyst && (
                      <span>Analyst: <span className="font-mono">{stage.analyst}</span></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
