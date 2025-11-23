import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Server,
    Activity,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Shield,
    Search,
    Target,
    Eye,
    Ban,
    FileText
} from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS, apiGet } from "@/config/api";

interface ServiceStatus {
    name: string;
    displayName: string;
    endpoint: string;
    status: 'online' | 'offline' | 'checking';
    icon: any;
    color: string;
}

export default function BackendStatus() {
    const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
    const [services, setServices] = useState<ServiceStatus[]>([
        {
            name: 'process_monitor',
            displayName: 'Process Monitor',
            endpoint: API_ENDPOINTS.process.health,
            status: 'checking',
            icon: Activity,
            color: 'text-primary'
        },
        {
            name: 'integrity_scanner',
            displayName: 'Integrity Scanner',
            endpoint: '/api/integrity/scan/test',
            status: 'checking',
            icon: Shield,
            color: 'text-success'
        },
        {
            name: 'ioc_hunting',
            displayName: 'IOC Hunting',
            endpoint: '/api/ioc/hunt',
            status: 'checking',
            icon: Target,
            color: 'text-warning'
        },
        {
            name: 'behavior_monitor',
            displayName: 'Behavior Monitor',
            endpoint: '/api/behavior/events',
            status: 'checking',
            icon: Eye,
            color: 'text-info'
        },
        {
            name: 'containment',
            displayName: 'Containment',
            endpoint: '/api/contain/isolate/test',
            status: 'checking',
            icon: Ban,
            color: 'text-critical'
        },
        {
            name: 'report_generation',
            displayName: 'Report Generation',
            endpoint: '/api/report/generate/test',
            status: 'checking',
            icon: FileText,
            color: 'text-purple-500'
        }
    ]);
    const [lastCheck, setLastCheck] = useState<Date>(new Date());

    const checkBackendHealth = async () => {
        try {
            // Check global health endpoint
            const healthData = await apiGet(API_ENDPOINTS.health);
            setServerStatus(healthData.status === 'healthy' ? 'online' : 'offline');

            // Update last check time
            setLastCheck(new Date());

            // Mark all services as online if health check passes
            setServices(prev => prev.map(service => ({
                ...service,
                status: 'online' as const
            })));

        } catch (error) {
            console.error('Health check failed:', error);
            setServerStatus('offline');
            setServices(prev => prev.map(service => ({
                ...service,
                status: 'offline' as const
            })));
        }
    };

    useEffect(() => {
        // Initial check
        checkBackendHealth();

        // Auto-refresh every 10 seconds
        const interval = setInterval(checkBackendHealth, 10000);

        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'online':
                return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Online</Badge>;
            case 'offline':
                return <Badge className="bg-critical text-critical-foreground"><XCircle className="h-3 w-3 mr-1" />Offline</Badge>;
            default:
                return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Checking</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                            <Server className="h-8 w-8 text-primary" />
                            Backend Status
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor Siren Backend services and health
                        </p>
                    </div>
                    <Button
                        onClick={checkBackendHealth}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {/* Server Overview */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <Card className="border-primary/20 shadow-lg backdrop-blur-md bg-card/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-primary" />
                            Server Overview
                        </CardTitle>
                        <CardDescription>Siren Backend unified API</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div>{getStatusBadge(serverStatus)}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Base URL</div>
                                <div className="text-sm font-mono text-foreground">{API_BASE_URL}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Last Checked</div>
                                <div className="text-sm text-foreground">{lastCheck.toLocaleTimeString()}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Services Grid */}
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Services Status</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={service.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                            >
                                <Card className="border-muted/20 shadow-md backdrop-blur-md bg-card/50 hover:shadow-xl transition-all hover:border-primary/30">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Icon className={`h-5 w-5 ${service.color}`} />
                                                {service.displayName}
                                            </CardTitle>
                                            {getStatusBadge(service.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground font-mono">
                                                {service.endpoint}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
