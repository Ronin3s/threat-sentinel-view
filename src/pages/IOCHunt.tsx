import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Download, Lock } from "lucide-react";
import { startIOCHunt, getIOCHunt, IOCHunt as IOCHuntResult, isolateHost } from "@/api/apiClient";
import { toast } from "sonner";

export default function IOCHunt() {
  const [iocType, setIocType] = useState("file_hash");
  const [iocValue, setIocValue] = useState("");
  const [hunting, setHunting] = useState(false);
  const [huntResult, setHuntResult] = useState<IOCHuntResult | null>(null);

  const handleStartHunt = async () => {
    if (!iocValue.trim()) {
      toast.error("Please enter an IOC value");
      return;
    }

    setHunting(true);
    setHuntResult(null);

    try {
      const { hunt_id } = await startIOCHunt(iocType, iocValue);
      toast.info(`Hunt started: ${hunt_id}`);

      // Poll for results
      setTimeout(async () => {
        const result = await getIOCHunt(hunt_id);
        setHuntResult(result);
        setHunting(false);

        if (result.matches.length > 0) {
          toast.warning(`Found ${result.matches.length} matches across network`);
        } else {
          toast.success("No matches found - IOC not present");
        }
      }, 2000);
    } catch (error) {
      toast.error("Hunt failed");
      setHunting(false);
    }
  };

  const handleContainHost = async (host: string) => {
    try {
      await isolateHost(host);
      toast.success(`Host ${host} isolated`);
    } catch (error) {
      toast.error("Failed to isolate host");
    }
  };

  const getIOCTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      file_hash: "File Hash (MD5/SHA256)",
      ip_address: "IP Address",
      domain: "Domain Name",
      url: "URL",
      email: "Email Address"
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">IOC Hunting & Cross-Host Search</h1>
        <p className="text-muted-foreground">
          Search for indicators of compromise across all monitored endpoints
        </p>
      </div>

      {/* Hunt Control */}
      <Card>
        <CardHeader>
          <CardTitle>Start IOC Hunt</CardTitle>
          <CardDescription>Enter an indicator of compromise to search across your network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>IOC Type</Label>
              <Select value={iocType} onValueChange={setIocType}>
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

            <div className="space-y-2">
              <Label>IOC Value</Label>
              <Input
                placeholder={
                  iocType === "file_hash"
                    ? "e.g., b40f6b2c167239519fcfb2028ab2524a"
                    : iocType === "ip_address"
                    ? "e.g., 192.168.1.100"
                    : iocType === "domain"
                    ? "e.g., malicious-domain.com"
                    : "Enter IOC value"
                }
                value={iocValue}
                onChange={(e) => setIocValue(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleStartHunt} disabled={hunting || !iocValue.trim()} className="w-full">
            {hunting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Hunting across network...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Hunt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Hunt Results */}
      {huntResult && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hunt Results</CardTitle>
                  <CardDescription>
                    {huntResult.matches.length} matches found for {getIOCTypeLabel(huntResult.ioc_type)}
                  </CardDescription>
                </div>
                <Badge
                  variant={huntResult.matches.length > 0 ? "destructive" : "default"}
                  className="text-sm"
                >
                  {huntResult.matches.length} Hosts Affected
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {huntResult.matches.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Affected Hosts</CardTitle>
                    <CardDescription>Systems where the IOC was detected</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Findings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Host</TableHead>
                      <TableHead>First Seen</TableHead>
                      <TableHead>Evidence Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {huntResult.matches.map((match, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono font-medium">{match.host}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(match.first_seen).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{match.evidence}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleContainHost(match.host)}
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              Contain Host
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Collect Evidence
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {huntResult.matches.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                  The specified IOC was not detected on any monitored endpoints
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
