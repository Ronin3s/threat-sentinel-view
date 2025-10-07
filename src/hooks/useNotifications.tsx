import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { generateRandomIncident } from "@/lib/mockData";
import { Incident } from "@/components/incidents/IncidentTable";
import { cn } from "@/lib/utils";

interface UseNotificationsProps {
  onIncidentClick: (incident: Incident) => void;
  enabled?: boolean;
}

export const useNotifications = ({ onIncidentClick, enabled = true }: UseNotificationsProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Generate a new incident every 30-60 seconds
    intervalRef.current = setInterval(() => {
      const incident = generateRandomIncident();
      
      const getSeverityColor = (severity: string) => {
        switch (severity) {
          case "Critical":
            return "bg-critical/20 border-critical text-critical";
          case "High":
            return "bg-warning/20 border-warning text-warning";
          case "Medium":
            return "bg-info/20 border-info text-info";
          case "Low":
            return "bg-success/20 border-success text-success";
          default:
            return "";
        }
      };

      toast.custom(
        (t) => (
          <div
            className={cn(
              "w-[400px] rounded-lg border-2 p-4 shadow-lg cursor-pointer transition-all hover:scale-105",
              "bg-card",
              getSeverityColor(incident.severity)
            )}
            onClick={() => {
              toast.dismiss(t);
              onIncidentClick(incident);
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">🚨 New Security Incident</h4>
                <span className="text-xs font-mono">{incident.id}</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">{incident.type}</p>
                <p className="text-xs opacity-90">Source: {incident.source}</p>
                <p className="text-xs opacity-90">Severity: {incident.severity}</p>
              </div>

              <p className="text-xs opacity-75">Click to view details</p>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: "top-right",
        }
      );
    }, Math.random() * 30000 + 30000); // 30-60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, onIncidentClick]);
};
