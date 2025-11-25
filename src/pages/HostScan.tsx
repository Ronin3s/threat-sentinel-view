import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Shield,
  AlertTriangle,
  FileSearch,
  CheckCircle,
  RefreshCw,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import sirenApi, { ScanJob } from '@/lib/api';

export default function HostScan() {
  const [hostId, setHostId] = useState('WIN-SRV-01');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanJob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const startScan = async () => {
    if (!hostId.trim()) {
      toast.error('Please enter a host ID');
      return;
    }

    setScanning(true);
    setScanResult(null);
    setJobId(null);

    try {
      const result = await sirenApi.integrity.startScan(hostId);
      setJobId(result.job_id);
      toast.success(`Scan started for ${hostId}`);

      // Poll for results
      pollScanResults(result.job_id);
    } catch (error) {
      console.error('Failed to start scan:', error);
      toast.error('Failed to start scan');
      setScanning(false);
    }
  };

  const pollScanResults = async (scanJobId: string) => {
    const maxAttempts = 20; // 20 seconds max
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        const result = await sirenApi.integrity.getScanResults(scanJobId);

        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(poll);
          setScanResult(result);
          setScanning(false);

          if (result.status === 'completed') {
            toast.success(`Scan completed! Found ${result.changes?.length || 0} changes`);
          } else {
            toast.error('Scan failed');
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setScanning(false);
          toast.warning('Scan is taking longer than expected. Check results manually.');
        }
      } catch (error) {
        console.error('Failed to fetch scan results:', error);
        clearInterval(poll);
        setScanning(false);
      }
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getSeverityBadge = (severity: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Host Integrity Scanner</h1>
        <p className="text-muted-foreground">
          Scan hosts for file changes and baseline deviations
        </p>
      </div>

      {/* Scan Input */}
      <Card>
        <CardHeader>
          <CardTitle>Start Integrity Scan</CardTitle>
          <CardDescription>
            Enter a host ID to scan for file integrity changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter host ID (e.g., WIN-SRV-01)"
              value={hostId}
              onChange={(e) => setHostId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startScan()}
              disabled={scanning}
              className="flex-1"
            />
            <Button
              onClick={startScan}
              disabled={scanning}
              className="gap-2"
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scanning Indicator */}
      {scanning && !scanResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Scanning {hostId}...</p>
              <p className="text-sm text-muted-foreground">
                Job ID: {jobId}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Results */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Baseline Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scanResult.baseline_score || 0}/100
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Files Scanned</CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scanResult.files_scanned || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Changes Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scanResult.changes?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Severity</CardTitle>
                <CheckCircle className={`h-4 w-4 ${getSeverityColor(scanResult.severity || 'low')}`} />
              </CardHeader>
              <CardContent>
                <Badge variant={getSeverityBadge(scanResult.severity || 'low')}>
                  {(scanResult.severity || 'low').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Changes List */}
          {scanResult.changes && scanResult.changes.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Detected Changes</CardTitle>
                <CardDescription>
                  {scanResult.changes.length} changes found on {scanResult.host}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanResult.changes.map((change, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {change.change}
                          </Badge>
                          <Badge variant={getSeverityBadge(change.severity)}>
                            {change.severity}
                          </Badge>
                        </div>
                        <p className="font-mono text-sm">{change.path}</p>
                        {change.hash && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Hash: {change.hash}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-green-500">
                  <CheckCircle className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">No Changes Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Host {scanResult.host} matches baseline
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!scanning && !scanResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No scan results yet</p>
              <p className="text-sm">Enter a host ID and click "Start Scan" to begin</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
