import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserActionLog } from "@/components/layout/UserActionLog";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Monitoring from "./pages/Monitoring";
import Rules from "./pages/Rules";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { mockUserActions } from "@/lib/mockData";

const queryClient = new QueryClient();

const App = () => {
  const [actionLogOpen, setActionLogOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <div className="flex min-h-screen bg-background">
              <Sidebar />
              <main className="ml-16 lg:ml-64 flex-1 p-8 transition-all duration-300">
                {/* Header with Actions */}
                <div className="mb-6 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionLogOpen(true)}
                    className="gap-2"
                  >
                    <History className="h-4 w-4" />
                    Activity Log
                  </Button>
                  <ThemeToggle />
                </div>

                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/incidents" element={<Incidents />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>

            <UserActionLog
              actions={mockUserActions}
              open={actionLogOpen}
              onClose={() => setActionLogOpen(false)}
            />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
