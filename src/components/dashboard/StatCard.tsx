import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "critical" | "warning" | "success";
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "border-border",
    critical: "border-critical/50 bg-critical/5",
    warning: "border-warning/50 bg-warning/5",
    success: "border-success/50 bg-success/5",
  };

  return (
    <Card className={cn("border", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={cn("text-xs", trend.isPositive ? "text-success" : "text-critical")}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-3",
            variant === "critical" && "bg-critical/10",
            variant === "warning" && "bg-warning/10",
            variant === "success" && "bg-success/10",
            variant === "default" && "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === "critical" && "text-critical",
              variant === "warning" && "text-warning",
              variant === "success" && "text-success",
              variant === "default" && "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
