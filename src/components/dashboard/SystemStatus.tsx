import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, Server, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemStatusProps {
  services?: Record<string, any> | null;
  onRefresh?: () => void;
}

export const SystemStatus = ({ services, onRefresh }: SystemStatusProps) => {
  const serviceList = services ? Object.keys(services) : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Backend Services</CardTitle>
        {onRefresh && (
          <Button onClick={onRefresh} variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!services ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading service status...
          </div>
        ) : serviceList.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No services found
          </div>
        ) : (
          serviceList.map((serviceName) => {
            const service = services[serviceName];
            const isHealthy = service?.status === 'healthy';

            return (
              <div key={serviceName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium capitalize">
                    {serviceName.replace(/_/g, ' ')}
                  </span>
                </div>
                <Badge variant={isHealthy ? 'default' : 'destructive'}>
                  {isHealthy ? 'Healthy' : 'Down'}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
