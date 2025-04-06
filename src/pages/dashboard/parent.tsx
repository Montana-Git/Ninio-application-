import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { getChildActivities, getEvents, getParentPayments, getChildren } from "@/lib/api";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard from "@/components/dashboard/StatCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import { EventCard } from "@/components/dashboard/EventCard";
import PaymentSection from "@/components/dashboard/parent/PaymentSection";
import { BookOpen, Calendar, DollarSign, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardAssistantButton from "@/components/ai/DashboardAssistantButton";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const [actualChildName, setActualChildName] = useState("your child");
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activities: { value: "0", change: 0 },
    attendance: { value: "0%", change: 0 },
    achievements: { value: "0", change: 0 },
    nextPayment: { value: "$0", dueIn: "N/A" },
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Handle event click
  const handleEventClick = (event: any) => {
    showNotification({
      title: event.title,
      message: `${event.date.toLocaleDateString()} at ${event.time}${event.location ? ` - ${event.location}` : ''}`,
      type: 'info',
    });
  };

  // Get the first child ID for the parent
  useEffect(() => {
    const fetchChildId = async () => {
      if (!user?.id) return;

      try {
        // Get the parent's children from the API
        const { data: childrenData, error } = await getChildren(user.id);

        if (error) {
          throw error;
        }

        // Store all children
        setChildren(childrenData || []);

        if (childrenData && childrenData.length > 0) {
          // Use the first child by default
          const firstChild = childrenData[0];
          setChildId(firstChild.id);
          setActualChildName(`${firstChild.first_name} ${firstChild.last_name}`);
        } else {
          // No children found
          setChildId(null);
          setActualChildName("No children found");
        }
      } catch (error) {
        console.error("Error fetching child ID:", error);
        showNotification({
          title: "Error",
          message: "Could not load your children's information. Please try again later.",
          type: "error"
        });
      }
    };

    fetchChildId();
  }, [user?.id, showNotification]);

  // Cache for dashboard data
  const [dataCache, setDataCache] = useState<{
    activities: any[] | null;
    events: any[] | null;
    payments: any[] | null;
    lastFetched: number;
  }>({
    activities: null,
    events: null,
    payments: null,
    lastFetched: 0
  });

  // Fetch dashboard data with optimized parallel requests and caching
  useEffect(() => {
    const CACHE_DURATION = 60000; // 1 minute cache
    const now = Date.now();
    const isCacheValid = now - dataCache.lastFetched < CACHE_DURATION;

    // Set initial loading state
    if (!isCacheValid) {
      setIsLoading(true);
    }

    const fetchDashboardData = async () => {
      try {
        // If cache is valid and we have data, use it
        if (isCacheValid) {
          if (childId && dataCache.activities) {
            processActivitiesData(dataCache.activities, childId);
          }
          if (dataCache.events) {
            processEventsData(dataCache.events);
          }
          if (user?.id && dataCache.payments) {
            processPaymentsData(dataCache.payments);
          }
          return;
        }

        // Create an array of promises for parallel execution
        const promises = [];
        let activitiesData = null;
        let eventsData = null;
        let paymentsData = null;

        // 1. Fetch activities data if childId exists
        if (childId) {
          const activitiesPromise = getChildActivities(childId)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching child activities:", error);
                return null;
              }
              activitiesData = data;
              processActivitiesData(data, childId);
              return data;
            });
          promises.push(activitiesPromise);
        }

        // 2. Fetch events data (only those visible to parents)
        const eventsPromise = getEvents(true) // true = visibleToParentsOnly
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching events:", error);
              return null;
            }
            eventsData = data;
            processEventsData(data);
            return data;
          });
        promises.push(eventsPromise);

        // 3. Fetch payment data if user exists
        if (user?.id) {
          const paymentsPromise = getParentPayments(user.id)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching payments:", error);
                return null;
              }
              paymentsData = data;
              processPaymentsData(data);
              return data;
            });
          promises.push(paymentsPromise);
        }

        // Execute all promises in parallel
        await Promise.all(promises);

        // Update cache
        setDataCache({
          activities: activitiesData,
          events: eventsData,
          payments: paymentsData,
          lastFetched: Date.now()
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showNotification({
          title: "Error Loading Dashboard",
          message: "There was a problem loading your dashboard data. Please try refreshing the page.",
          type: "error"
        });
      } finally {
        // Add a small delay to ensure UI updates properly
        setTimeout(() => {
          setIsLoading(false);
          console.log('Dashboard data loaded, setting isLoading to false');
        }, 300);
      }
    };

    // Helper function to process activities data
    const processActivitiesData = (activitiesData: any[], childId: string) => {
      if (!activitiesData) return;

      // Calculate activities stats
      const totalActivities = activitiesData.length;
      const thisMonthActivities = activitiesData.filter((activity: any) => {
        try {
          const activityDate = new Date(activity.activity_date);
          const now = new Date();
          return activityDate.getMonth() === now.getMonth() &&
                 activityDate.getFullYear() === now.getFullYear();
        } catch (dateError) {
          console.error("Error parsing activity date:", dateError);
          return false;
        }
      }).length;

      // Update activities stats
      setStats(prev => ({
        ...prev,
        activities: {
          value: thisMonthActivities.toString(),
          change: thisMonthActivities - (totalActivities - thisMonthActivities)
        },
        // Placeholder for attendance and achievements until we have real data
        attendance: { value: "92%", change: 2.5 },
        achievements: { value: "5", change: 3 }
      }));

      // Create recent activities from activities data
      const recentActs = activitiesData.slice(0, 3).map((activity: any) => ({
        id: activity.id,
        title: activity.title || 'Activity Completed',
        description: `${actualChildName} completed ${activity.description || 'an activity'}`,
        timestamp: new Date(activity.activity_date),
        icon: <BookOpen className="h-4 w-4" />,
        type: 'success'
      }));

      setRecentActivities(recentActs);
    };

    // Helper function to process events data
    const processEventsData = (eventsData: any[]) => {
      if (!eventsData) return;

      // Create upcoming events from events data
      const upcomingEvts = eventsData
        .filter((event: any) => {
          try {
            return new Date(event.date) >= new Date();
          } catch (dateError) {
            console.error("Error parsing event date:", dateError);
            return false;
          }
        })
        .slice(0, 3)
        .map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          time: event.time,
          type: 'primary' as const,
          location: event.location,
          description: event.description
        }));

      setUpcomingEvents(upcomingEvts);
    };

    // Helper function to process payments data
    const processPaymentsData = (paymentsData: any[]) => {
      if (!paymentsData || paymentsData.length === 0) return;

      // Find the next upcoming payment
      const upcomingPayments = paymentsData
        .filter((payment: any) => payment.status === 'pending' && payment.due_date)
        .sort((a: any, b: any) => {
          try {
            return new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime();
          } catch (dateError) {
            console.error("Error comparing payment dates:", dateError);
            return 0;
          }
        });

      if (upcomingPayments.length > 0) {
        const nextPayment = upcomingPayments[0];
        try {
          const dueDate = new Date(nextPayment.due_date!);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          setStats(prev => ({
            ...prev,
            nextPayment: {
              value: `$${nextPayment.amount}`,
              dueIn: daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : "Due today"
            }
          }));
        } catch (dateError) {
          console.error("Error calculating payment due date:", dateError);
        }
      }
    };

    fetchDashboardData();
  }, [childId, user?.id, actualChildName, showNotification, dataCache.lastFetched]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Parent Dashboard | Ninio</title>
      </Helmet>

      {/* Sidebar - now gets user info from AuthContext */}
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader title="Parent Dashboard" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid gap-6">
            {/* Child Selector */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              {isLoading && children.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading children information...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium mb-2">Selected Child: {actualChildName}</h2>
                      <p className="text-sm text-gray-500">
                        {children.length > 0
                          ? `You can view information for ${actualChildName} or select another child below.`
                          : 'You have not added any children yet. Please add a child in your profile settings.'}
                      </p>
                    </div>
                    {children.length === 0 && (
                      <Button
                        onClick={() => window.location.href = '/dashboard/parent/profile'}
                        variant="outline"
                      >
                        Add Child
                      </Button>
                    )}
                  </div>

                  {children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {children.map((child) => (
                        <Button
                          key={child.id}
                          variant={childId === child.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setChildId(child.id);
                            setActualChildName(`${child.first_name} ${child.last_name}`);
                          }}
                        >
                          {child.first_name} {child.last_name}
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Activities"
                value={stats.activities.value}
                change={stats.activities.change}
                icon={<BookOpen className="h-8 w-8" />}
                animate
                animationDelay={100}
                isLoading={isLoading}
              />
              <StatCard
                title="Attendance"
                value={stats.attendance.value}
                change={stats.attendance.change}
                icon={<Users className="h-8 w-8" />}
                animate
                animationDelay={200}
                isLoading={isLoading}
              />
              <StatCard
                title="Achievements"
                value={stats.achievements.value}
                isLoading={isLoading}
                change={stats.achievements.change}
                icon={<GraduationCap className="h-8 w-8" />}
                animate
                animationDelay={300}
              />
              <StatCard
                title="Next Payment"
                value={stats.nextPayment.value}
                description={stats.nextPayment.dueIn}
                icon={<DollarSign className="h-8 w-8" />}
                animate
                animationDelay={400}
                isLoading={isLoading}
              />
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upcoming Events */}
              <DashboardCard
                title="Upcoming Events"
                icon={<Calendar className="h-5 w-5" />}
                animate
                animationDelay={500}
                isLoading={isLoading}
              >
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  )}
                  <Button variant="outline" className="w-full">View All Events</Button>
                </div>
              </DashboardCard>

              {/* Recent Activities */}
              <ActivityCard
                title="Recent Activities"
                activities={recentActivities}
                emptyMessage="No recent activities"
                animate
                animationDelay={600}
                onViewAll={() => console.log('View all activities')}
                isLoading={isLoading}
              />
            </div>

            {/* Payments Section */}
            <PaymentSection childName={actualChildName} />
          </div>
        </main>
      </div>

      {/* Dashboard Assistant Button */}
      <DashboardAssistantButton />
    </div>
  );
}
