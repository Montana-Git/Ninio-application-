import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import analyticsDataService from "@/services/analytics-data-service";
import { useAnalytics } from "@/contexts/AnalyticsContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { trackFeatureUse } = useAnalytics();

  // State for analytics data
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activityParticipationData, setActivityParticipationData] = useState([]);
  const [summary, setSummary] = useState({
    childrenCount: 0,
    monthlyRevenue: 0,
    upcomingEvents: 0,
    attendanceRate: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsRefreshing(true);

      // Track feature use
      trackFeatureUse('analytics-dashboard', 'refresh');

      // Fetch all data in parallel
      const [
        enrollmentResult,
        ageGroupResult,
        revenueResult,
        attendanceResult,
        activityResult,
        summaryResult
      ] = await Promise.all([
        analyticsDataService.getEnrollmentData(),
        analyticsDataService.getAgeGroupData(),
        analyticsDataService.getRevenueData(),
        analyticsDataService.getAttendanceData(),
        analyticsDataService.getActivityParticipationData(),
        analyticsDataService.getAnalyticsSummary()
      ]);

      // Update state with fetched data
      setEnrollmentData(enrollmentResult);
      setAgeGroupData(ageGroupResult);
      setRevenueData(revenueResult);
      setAttendanceData(attendanceResult);
      setActivityParticipationData(activityResult);
      setSummary(summaryResult);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAnalyticsData();

    // Track dashboard view
    trackFeatureUse('analytics-dashboard', 'view');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Overview of kindergarten performance and metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalyticsData}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Children</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 my-1" />
              ) : (
                <h3 className="text-2xl font-bold">{summary.childrenCount}</h3>
              )}
              <p className="text-xs text-green-500">+12% from last month</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 my-1" />
              ) : (
                <h3 className="text-2xl font-bold">${summary.monthlyRevenue.toLocaleString()}</h3>
              )}
              <p className="text-xs text-green-500">+14% from last month</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Events</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 my-1" />
              ) : (
                <h3 className="text-2xl font-bold">{summary.upcomingEvents}</h3>
              )}
              <p className="text-xs text-blue-500">Next: Summer Festival</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance Rate</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 my-1" />
              ) : (
                <h3 className="text-2xl font-bold">{summary.attendanceRate}%</h3>
              )}
              <p className="text-xs text-green-500">+3% from last month</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={enrollmentData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Age Group Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageGroupData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      {ageGroupData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#82ca9d" />
                  <Bar dataKey="absent" stackId="a" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Participation</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityParticipationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityParticipationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
