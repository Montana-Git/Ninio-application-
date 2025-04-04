import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ReportService, ReportType, ReportFilter, ReportData } from '@/services/report-service';
import { useNotification } from '@/contexts/NotificationContext';
import { FileText, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReportGeneratorProps {
  defaultType?: ReportType;
  parentId?: string;
  childId?: string;
  className?: string;
}

export function ReportGenerator({
  defaultType = 'activities',
  parentId,
  childId,
  className,
}: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>(defaultType);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const { showNotification } = useNotification();

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      const filters: ReportFilter = {
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        parentId,
        childId,
        category: category === 'all' ? undefined : category,
        status: status === 'all' ? undefined : status,
      };

      const { data, error } = await ReportService.generateReport(reportType, filters);

      if (error) throw error;

      setReportData(data);

      showNotification({
        type: 'success',
        title: 'Report Generated',
        message: `Your ${reportType} report has been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification({
        type: 'error',
        title: 'Report Generation Failed',
        message: 'There was an error generating your report. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!reportData) return;

    const csv = ReportService.exportToCsv(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryOptions = () => {
    switch (reportType) {
      case 'activities':
        return [
          { value: 'all', label: 'All Categories' },
          { value: 'art', label: 'Art' },
          { value: 'music', label: 'Music' },
          { value: 'sports', label: 'Sports' },
          { value: 'science', label: 'Science' },
          { value: 'language', label: 'Language' },
        ];
      case 'payments':
        return [
          { value: 'all', label: 'All Categories' },
          { value: 'tuition', label: 'Tuition' },
          { value: 'materials', label: 'Materials' },
          { value: 'events', label: 'Events' },
          { value: 'meals', label: 'Meals' },
          { value: 'transportation', label: 'Transportation' },
        ];
      case 'events':
        return [
          { value: 'all', label: 'All Types' },
          { value: 'holiday', label: 'Holiday' },
          { value: 'field-trip', label: 'Field Trip' },
          { value: 'parent-meeting', label: 'Parent Meeting' },
          { value: 'performance', label: 'Performance' },
          { value: 'workshop', label: 'Workshop' },
        ];
      default:
        return [{ value: 'all', label: 'All Categories' }];
    }
  };

  const getStatusOptions = () => {
    if (reportType === 'payments') {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'refunded', label: 'Refunded' },
      ];
    }
    return [];
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Select the type of report and filters to generate a custom report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activities">Activities Report</SelectItem>
                <SelectItem value="payments">Payments Report</SelectItem>
                <SelectItem value="attendance">Attendance Report</SelectItem>
                <SelectItem value="children">Children Report</SelectItem>
                <SelectItem value="events">Events Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                className="w-full"
              />
            </div>
          </div>

          {getCategoryOptions().length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {getStatusOptions().length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {reportData && (
        <AnimatedCard
          className="mt-6"
          title={reportData.title}
          description={reportData.description}
          animation="fade-in-up"
          footer={
            <div className="flex justify-between items-center w-full">
              <p className="text-sm text-muted-foreground">
                Generated: {reportData.generatedAt}
              </p>
              <Button variant="outline" onClick={handleDownloadCsv}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {reportData.summary && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => {
                    if (typeof value === 'object') {
                      return (
                        <div key={key} className="space-y-1">
                          <h4 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <ul className="text-sm">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <li key={subKey} className="flex justify-between">
                                <span className="capitalize">{subKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="font-medium">{String(subValue)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.rows.map((row, index) => (
                    <TableRow key={index}>
                      {reportData.columns.map((column) => {
                        // Convert column name to camelCase property
                        const prop = column.charAt(0).toLowerCase() +
                          column.slice(1).replace(/\s+(.)/g, (_, c) => c.toUpperCase());

                        return (
                          <TableCell key={column}>
                            {row[prop] || 'N/A'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}
