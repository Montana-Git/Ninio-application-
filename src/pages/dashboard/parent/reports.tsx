
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { ReportGenerator } from '@/components/reports/report-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, DollarSign, Users } from 'lucide-react';

const ReportsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Reports | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar - now gets user info from AuthContext */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {t('parent.reports.title', 'Reports')}
            </h1>
            <p className="text-gray-600">
              {t('parent.reports.subtitle', 'Generate and view reports about your child\'s activities and progress')}
            </p>
          </div>

          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Activities Report</CardTitle>
                  <CardDescription>
                    Generate a report of your child's activities over a specific time period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportGenerator
                    defaultType="activities"
                    parentId={user?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Report</CardTitle>
                  <CardDescription>
                    Generate a report of your child's attendance records.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportGenerator
                    defaultType="attendance"
                    parentId={user?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payments Report</CardTitle>
                  <CardDescription>
                    Generate a report of your payment history and upcoming payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportGenerator
                    defaultType="payments"
                    parentId={user?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Report</CardTitle>
                  <CardDescription>
                    Generate a custom report by selecting the type and filters.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportGenerator
                    parentId={user?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
