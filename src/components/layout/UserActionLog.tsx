import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, AlertTriangle, Settings, Activity } from "lucide-react";
import { UserAction } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface UserActionLogProps {
  actions: UserAction[];
  open: boolean;
  onClose: () => void;
}

export const UserActionLog = ({ actions, open, onClose }: UserActionLogProps) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "incident":
        return <AlertTriangle className="h-4 w-4 text-critical" />;
      case "rule":
        return <Settings className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-info" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "incident":
        return "border-critical/50 bg-critical/10 text-critical";
      case "rule":
        return "border-warning/50 bg-warning/10 text-warning";
      default:
        return "border-info/50 bg-info/10 text-info";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">User Activity Log</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(action.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">{action.action}</p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono">
                        {action.username}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", getActionColor(action.type))}>
                        {action.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {action.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
