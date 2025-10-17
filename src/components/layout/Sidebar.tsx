import { Home, AlertTriangle, Activity, Settings, FileText, Shield, ChevronLeft, ChevronRight, Search, Cpu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Host Scan", href: "/host-scan", icon: Shield },
  { name: "Process Monitor", href: "/process-monitor", icon: Cpu },
  { name: "Behavior Monitor", href: "/behavior-monitor", icon: Activity },
  { name: "IOC Hunt", href: "/ioc-hunt", icon: Search },
  { name: "Playbooks", href: "/playbooks", icon: FileText },
  { name: "Monitoring", href: "/monitoring", icon: Activity },
  { name: "Rules", href: "/rules", icon: Settings },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Auto Reports", href: "/auto-reports", icon: FileText },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border transition-all",
          collapsed ? "justify-center px-2" : "gap-2 px-6"
        )}>
          <Shield className="h-8 w-8 text-primary flex-shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">SecureWatch</h1>
              <p className="text-xs text-muted-foreground">SOC Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-sidebar-foreground">System Active</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full hover:bg-sidebar-accent",
              collapsed && "px-2"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};
