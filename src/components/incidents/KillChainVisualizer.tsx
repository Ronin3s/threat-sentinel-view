import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface KillChainStage {
  stage: string;
  evidence: string[];
  timestamp?: string;
}

interface KillChainVisualizerProps {
  stages: KillChainStage[];
}

const killChainStages = [
  { id: "reconnaissance", label: "Reconnaissance", description: "Gathering information about the target" },
  { id: "weaponization", label: "Weaponization", description: "Creating malicious payload" },
  { id: "delivery", label: "Delivery", description: "Transmitting the weapon to target" },
  { id: "exploitation", label: "Exploitation", description: "Triggering the vulnerability" },
  { id: "installation", label: "Installation", description: "Installing malware on target" },
  { id: "command_control", label: "Command & Control", description: "Establishing C2 channel" },
  { id: "actions", label: "Actions on Objectives", description: "Achieving attacker goals" }
];

export const KillChainVisualizer = ({ stages }: KillChainVisualizerProps) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const isStageActive = (stageId: string) => {
    return stages.some(s => s.stage.toLowerCase().includes(stageId.split('_')[0]));
  };

  const getStageData = (stageId: string) => {
    return stages.find(s => s.stage.toLowerCase().includes(stageId.split('_')[0]));
  };

  const getStageColor = (stageId: string) => {
    if (!isStageActive(stageId)) return "bg-muted text-muted-foreground";
    
    const stageIndex = killChainStages.findIndex(s => s.id === stageId);
    if (stageIndex <= 2) return "bg-info/20 text-info border-info";
    if (stageIndex <= 4) return "bg-warning/20 text-warning border-warning";
    return "bg-critical/20 text-critical border-critical";
  };

  return (
    <div className="space-y-6">
      {/* Kill Chain Stages */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-2">
          {killChainStages.map((stage, index) => {
            const isActive = isStageActive(stage.id);
            const stageData = getStageData(stage.id);
            
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(isActive ? stage.id : null)}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                  getStageColor(stage.id),
                  isActive && "cursor-pointer hover:scale-105",
                  !isActive && "cursor-not-allowed opacity-50",
                  selectedStage === stage.id && "ring-2 ring-primary"
                )}
                disabled={!isActive}
              >
                {isActive && (
                  <CheckCircle2 className="absolute -top-2 -right-2 h-5 w-5 text-success bg-background rounded-full" />
                )}
                
                <div className="text-center">
                  <div className="text-xs font-semibold mb-1">Stage {index + 1}</div>
                  <div className="text-xs font-medium leading-tight">{stage.label}</div>
                </div>

                {/* Connector Line */}
                {index < killChainStages.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-1/2 -right-2 w-2 h-0.5",
                      isActive && isStageActive(killChainStages[index + 1].id)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Details */}
      {selectedStage && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {killChainStages.find(s => s.id === selectedStage)?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {killChainStages.find(s => s.id === selectedStage)?.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Evidence</h4>
              <div className="space-y-2">
                {getStageData(selectedStage)?.evidence.map((evidence, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">{evidence.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Recommended Actions</h4>
              <div className="space-y-2">
                {selectedStage.includes('reconnaissance') && (
                  <p className="text-sm text-muted-foreground">• Review firewall logs and block scanning IPs</p>
                )}
                {selectedStage.includes('delivery') && (
                  <p className="text-sm text-muted-foreground">• Quarantine email attachments and malicious URLs</p>
                )}
                {selectedStage.includes('exploitation') && (
                  <p className="text-sm text-muted-foreground">• Apply security patches and isolate affected systems</p>
                )}
                {selectedStage.includes('installation') && (
                  <p className="text-sm text-muted-foreground">• Remove malware and restore from clean backup</p>
                )}
                {selectedStage.includes('command') && (
                  <p className="text-sm text-muted-foreground">• Block C2 domains/IPs and terminate malicious processes</p>
                )}
                {selectedStage.includes('actions') && (
                  <p className="text-sm text-muted-foreground">• Assess data breach scope and initiate incident response</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
