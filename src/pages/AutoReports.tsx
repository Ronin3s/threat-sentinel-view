import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye, CheckCircle2, Lightbulb } from "lucide-react";
import { generateIncidentReport, getIncidentReport, IncidentReport } from "@/api/apiClient";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AutoReports() {
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      toast.info("Generating incident report...");
      const { report_id } = await generateIncidentReport("inc-demo");
      
      setTimeout(async () => {
        const report = await getIncidentReport(report_id);
        setReports(prev => [report, ...prev]);
        setGenerating(false);
        toast.success("Report generated successfully");
      }, 2000);
    } catch (error) {
      toast.error("Failed to generate report");
      setGenerating(false);
    }
  };

  const handleViewReport = (report: IncidentReport) => {
    setSelectedReport(report);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Post-Incident Reports</h1>
          <p className="text-muted-foreground">
            Automated incident analysis and lessons learned documentation
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={generating}>
          <FileText className="mr-2 h-4 w-4" />
          {generating ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Reports Generated</h3>
            <p className="text-muted-foreground mb-4">
              Generate post-incident reports for closed incidents
            </p>
            <Button onClick={handleGenerateReport} disabled={generating}>
              Generate Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>Post-incident analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.report_id}>
                    <TableCell className="font-mono">{report.report_id}</TableCell>
                    <TableCell className="font-mono">{report.incident_id}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(report.generated_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {report.summary}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          PDF
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

      {/* Report Preview Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Incident Report</DialogTitle>
            <DialogDescription>
              {selectedReport?.report_id} • Generated {selectedReport && new Date(selectedReport.generated_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Executive Summary
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm">{selectedReport.summary}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Impact Assessment */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Impact Assessment</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm">{selectedReport.impact}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions Taken */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Actions Taken
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {selectedReport.actions_taken.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    Recommendations
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {selectedReport.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-warning mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    Apply Recommendations
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
