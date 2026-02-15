import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Target,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import sirenApi, { type IOCHunt as IOCHuntType } from '@/lib/api';

export default function IOCHuntPage() {
  const [iocType, setIocType] = useState('file_hash');
  const [iocValue, setIocValue] = useState('');
  const [hunting, setHunting] = useState(false);
  const [huntResult, setHuntResult] = useState<IOCHuntType | null>(null);
  const [huntId, setHuntId] = useState<string | null>(null);

  const startHunt = async () => {
    if (!iocValue.trim()) {
      toast.error('Please enter an IOC value');
      return;
    }

    setHunting(true);
    setHuntResult(null);
    setHuntId(null);

    try {
      const result = await sirenApi.ioc.startHunt(iocType, iocValue);

      if (result.status === 'error') {
        toast.error('Invalid IOC format');
        setHunting(false);
        return;
      }

      setHuntId(result.hunt_id);
      toast.success(`Hunt started across infrastructure`);

      // Poll for results
      pollHuntResults(result.hunt_id);
    } catch (error) {
      console.error('Failed to start hunt:', error);
      toast.error('Failed to start IOC hunt');
      setHunting(false);
    }
  };

  const pollHuntResults = async (huntJobId: string) => {
    const maxAttempts = 15; // 15 seconds max
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        const result = await sirenApi.ioc.getHuntResults(huntJobId);

        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(poll);
          setHuntResult(result);
          setHunting(false);

          if (result.status === 'completed') {
            const matchCount = result.matches?.length || 0;
            if (matchCount > 0) {
              toast.success(`Hunt completed! Found ${matchCount} matches`);
            } else {
              toast.success('Hunt completed - No matches found');
            }
          } else {
            toast.error('Hunt failed');
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setHunting(false);
          toast.warning('Hunt is taking longer than expected');
        }
      } catch (error) {
        console.error('Failed to fetch hunt results:', error);
        clearInterval(poll);
        setHunting(false);
      }
    }, 1000);
  };

  const getIocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      file_hash: 'File Hash',
      ip_address: 'IP Address',
      domain: 'Domain',
      url: 'URL',
      email: 'Email'
    };
    return labels[type] || type;
  };

  const getPlaceholder = () => {
    const placeholders: Record<string, string> = {
      file_hash: 'e.g., b40f6b2c167239519fcfb2028ab2524a',
      ip_address: 'e.g., 192.168.1.100',
      domain: 'e.g., malicious-domain.com',
      url: 'e.g., http://malicious-site.com/payload',
      email: 'e.g., attacker@malicious.com'
    };
    return placeholders[iocType] || 'Enter IOC value';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">IOC Hunting</h1>
        <p className="text-muted-foreground">
          Search for Indicators of Compromise across your infrastructure
        </p>
      </div>

      {/* Hunt Input */}
      <Card>
        <CardHeader>
          <CardTitle>Start IOC Hunt</CardTitle>
          <CardDescription>
            Search for malicious indicators across all monitored hosts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">IOC Type</label>
              <Select value={iocType} onValueChange={setIocType} disabled={hunting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_hash">File Hash (MD5/SHA256)</SelectItem>
                  <SelectItem value="ip_address">IP Address</SelectItem>
                  <SelectItem value="domain">Domain Name</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="email">Email Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                IOC Value
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={getPlaceholder()}
                  value={iocValue}
                  onChange={(e) => setIocValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startHunt()}
                  disabled={hunting}
                  className="flex-1"
                />
                <Button
                  onClick={startHunt}
                  disabled={hunting}
                  className="gap-2"
                >
                  {hunting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Hunting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Hunt
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hunting Indicator */}
      {hunting && !huntResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Target className="h-12 w-12 animate-pulse text-primary mb-4" />
              <p className="text-lg font-medium">Hunting for IOC...</p>
              <p className="text-sm text-muted-foreground">
                Searching across monitored infrastructure
              </p>
              {huntId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Hunt ID: {huntId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hunt Results */}
      {huntResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IOC Type</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {getIocTypeLabel(huntResult.ioc_type)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {huntResult.ioc_value}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hosts Scanned</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {huntResult.hosts_scanned || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matches Found</CardTitle>
                {huntResult.matches_found && huntResult.matches_found > 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={huntResult.matches_found && huntResult.matches_found > 0 ? 'text-red-500' : 'text-green-500'}>
                    {huntResult.matches_found || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches List */}
          {huntResult.matches && huntResult.matches.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Matches Detected
                </CardTitle>
                <CardDescription>
                  IOC found on {huntResult.matches.length} host(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {huntResult.matches.map((match, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">{match.host}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {match.confidence}
                          </Badge>
                        </div>
                        <p className="font-mono text-sm mb-1">{match.evidence}</p>
                        <p className="text-xs text-muted-foreground">
                          First seen: {new Date(match.first_seen).toLocaleString()}
                        </p>
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
                  <p className="text-lg font-medium">No Matches Found</p>
                  <p className="text-sm text-muted-foreground">
                    IOC not detected on any monitored hosts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!hunting && !huntResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Target className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No hunt results yet</p>
              <p className="text-sm">Select IOC type and value, then click "Start Hunt"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
