import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Eye, AlertTriangle } from "lucide-react";
import { Incident } from "./IncidentTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IncidentTimeline } from "./IncidentTimeline";
import { ProcessTree } from "./ProcessTree";
import { KillChainVisualizer } from "./KillChainVisualizer";
import { mockIncidentTimeline, mockProcessTree } from "@/lib/mockData";
import { getIncidentKillChain } from "@/api/apiClient";

interface IncidentDetailModalProps {
  incident: Incident | null;
  open: boolean;
  onClose: () => void;
}

export const IncidentDetailModal = ({ incident, open, onClose }: IncidentDetailModalProps) => {
  const [killChainData, setKillChainData] = useState<any>(null);

  useEffect(() => {
    if (incident && open) {
      getIncidentKillChain(incident.id).then(setKillChainData);
    }
  }, [incident, open]);

  if (!incident) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-critical text-critical-foreground";
      case "High":
        return "bg-warning text-warning-foreground";
      case "Medium":
        return "bg-info text-info-foreground";
      case "Low":
        return "bg-success text-success-foreground";
      default:
        return "";
    }
  };

  const handleAcknowledge = () => {
    toast.success("Incident acknowledged");
    onClose();
  };

  const handleResolve = () => {
    toast.success("Incident marked as resolved");
    onClose();
  };

  const handleInvestigate = () => {
    toast.info("Starting investigation...");
    onClose();
  };

  const timeline = mockIncidentTimeline[incident.id] || [];
  const processTree = mockProcessTree[incident.id];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              Incident Details
            </DialogTitle>
            <Badge className={cn("font-medium", getSeverityColor(incident.severity))}>
              {incident.severity}
            </Badge>
          </div>
          <DialogDescription className="text-muted-foreground">
            {incident.id} • {incident.timestamp}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="killchain">Kill Chain</TabsTrigger>
            <TabsTrigger value="process">Process Tree</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-foreground">{incident.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <p className="font-mono text-foreground">{incident.source}</p>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-foreground">{incident.description}</p>
            </div>

            {incident.processName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Process Name</label>
                <p className="font-mono text-foreground">{incident.processName}</p>
              </div>
            )}

            {incident.affectedFile && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Affected File</label>
                <p className="font-mono text-sm text-foreground break-all">{incident.affectedFile}</p>
              </div>
            )}

            {incident.analysis && (
              <div className="rounded-lg bg-muted/50 p-4">
                <label className="text-sm font-medium text-muted-foreground">Analysis</label>
                <p className="mt-2 text-sm text-foreground">{incident.analysis}</p>
              </div>
            )}

            <Separator className="bg-border" />

            <div className="flex gap-2">
              <Button onClick={handleAcknowledge} variant="outline" className="flex-1">
                <CheckCircle className="mr-2 h-4 w-4" />
                Acknowledge
              </Button>
              <Button onClick={handleInvestigate} variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Investigate
              </Button>
              <Button onClick={handleResolve} className="flex-1 bg-success hover:bg-success/90">
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolve
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            {timeline.length > 0 ? (
              <IncidentTimeline stages={timeline} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No timeline data available for this incident
              </div>
            )}
          </TabsContent>

          <TabsContent value="killchain" className="mt-4">
            {killChainData ? (
              <KillChainVisualizer stages={killChainData.stages} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Loading kill chain analysis...
              </div>
            )}
          </TabsContent>

          <TabsContent value="process" className="mt-4">
            {processTree ? (
              <ProcessTree rootProcess={processTree} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No process tree data available for this incident
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
