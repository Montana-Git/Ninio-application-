import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import ActivitiesManagement from "@/components/dashboard/admin/ActivitiesManagement";
import EventsManagement from "@/components/dashboard/admin/EventsManagement";
import PaymentManagement from "@/components/dashboard/admin/PaymentManagement";
import ChildrenManagement from "@/components/dashboard/admin/ChildrenManagement";
import ParentsManagement from "@/components/dashboard/admin/ParentsManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Users,
  UserRound,
  Loader2,
} from "lucide-react";
import { getChildren, getEvents, getPayments, getUsers } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: "Total Students",
      value: "--",
      icon: <Activity className="h-5 w-5 text-blue-500" />,
      change: "Loading...",
      trend: "neutral",
    },
    {
      title: "Upcoming Events",
      value: "--",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      change: "Loading...",
      trend: "neutral",
    },
    {
      title: "Pending Payments",
      value: "--",
      icon: <CreditCard className="h-5 w-5 text-amber-500" />,
      change: "Loading...",
      trend: "neutral",
    },
    {
      title: "Activities This Week",
      value: "--",
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      change: "Loading...",
      trend: "neutral",
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch children data
        const { data: childrenData } = await getChildren();
        const totalStudents = childrenData?.length || 0;

        // Fetch events data
        const { data: eventsData } = await getEvents();
        const upcomingEvents = eventsData?.filter(event => new Date(event.date) >= new Date()).length || 0;
        let nextEventName = "None scheduled";

        if (eventsData && eventsData.length > 0) {
          // Sort events by date
          const sortedEvents = [...eventsData].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Find the next upcoming event
          const nextEvent = sortedEvents.find(event => new Date(event.date) >= new Date());
          if (nextEvent) {
            nextEventName = nextEvent.title;
          }
        }

        // Fetch payments data
        const { data: paymentsData } = await getPayments();
        const pendingPayments = paymentsData?.filter(payment => payment.status === 'pending').length || 0;
        const pendingAmount = paymentsData
          ?.filter(payment => payment.status === 'pending')
          .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

        // Update dashboard stats
        setDashboardStats([
          {
            title: "Total Students",
            value: totalStudents.toString(),
            icon: <Activity className="h-5 w-5 text-blue-500" />,
            change: "+2 this month", // This would ideally be calculated from historical data
            trend: "up",
          },
          {
            title: "Upcoming Events",
            value: upcomingEvents.toString(),
            icon: <Calendar className="h-5 w-5 text-green-500" />,
            change: `Next: ${nextEventName}`,
            trend: "neutral",
          },
          {
            title: "Pending Payments",
            value: `$${pendingAmount.toLocaleString()}`,
            icon: <CreditCard className="h-5 w-5 text-amber-500" />,
            change: `${pendingPayments} payments due`,
            trend: pendingPayments > 0 ? "down" : "up",
          },
          {
            title: "Activities This Week",
            value: "12", // This would need to be calculated from activities data
            icon: <Activity className="h-5 w-5 text-purple-500" />,
            change: "+3 from last week", // This would ideally be calculated from historical data
            trend: "up",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        userName={user?.first_name ? `${user.first_name} ${user.last_name}` : "Admin User"}
        userRole="admin"
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || "Admin"}`}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {t("admin.dashboard.title")}
            </h1>
            <p className="text-gray-600">{t("admin.dashboard.subtitle")}</p>
          </div>

          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-6 w-full max-w-4xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {t("admin.overview")}
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {t("admin.activities")}
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("admin.events")}
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t("admin.payments")}
              </TabsTrigger>
              <TabsTrigger value="children" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("admin.children")}
              </TabsTrigger>
              <TabsTrigger value="parents" className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                {t("admin.parents")}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {dashboardStats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {stat.title}
                          </p>
                          {isLoading ? (
                            <>
                              <Skeleton className="h-8 w-16 my-1" />
                              <Skeleton className="h-4 w-24 mt-1" />
                            </>
                          ) : (
                            <>
                              <h3 className="text-2xl font-bold mt-1">
                                {stat.value}
                              </h3>
                              <p
                                className={`text-xs mt-1 ${stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"}`}
                              >
                                {stat.change}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="p-2 rounded-full bg-gray-100">
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : stat.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Recent Activities
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Finger Painting",
                          date: "Today",
                          ageGroup: "3-4 years",
                        },
                        {
                          name: "Story Time",
                          date: "Yesterday",
                          ageGroup: "2-5 years",
                        },
                        {
                          name: "Outdoor Play",
                          date: "2 days ago",
                          ageGroup: "3-5 years",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{activity.name}</h4>
                            <p className="text-sm text-gray-500">
                              {activity.ageGroup}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {activity.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Upcoming Events
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Parent-Teacher Meeting",
                          date: "June 15, 2023",
                          location: "Main Hall",
                        },
                        {
                          title: "Summer Festival",
                          date: "July 20, 2023",
                          location: "Kindergarten Playground",
                        },
                        {
                          title: "Art Exhibition",
                          date: "August 5, 2023",
                          location: "Art Room",
                        },
                      ].map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {event.location}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {event.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <ActivitiesManagement />
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <EventsManagement />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <PaymentManagement />
            </TabsContent>

            {/* Children Tab */}
            <TabsContent value="children">
              <ChildrenManagement />
            </TabsContent>

            {/* Parents Tab */}
            <TabsContent value="parents">
              <ParentsManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
