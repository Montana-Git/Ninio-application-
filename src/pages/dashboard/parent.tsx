import { useEffect, useState } from "react";
import { ensureUniqueId } from "@/lib/uniqueId";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { getChildActivities, getEvents, getParentEvents, getParentActivities, getParentPayments, getChildren } from "@/lib/api";
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
  const [isLoading, setIsLoading] = useState(false); // Start with false to show cards immediately
  const [childId, setChildId] = useState<string | null>(null);
  const [actualChildName, setActualChildName] = useState("your child");
  const [children, setChildren] = useState<any[]>([]);
  // Initialize with default stats
  const [stats, setStats] = useState({
    activities: { value: "3", change: 1 },
    attendance: { value: "92%", change: 2.5 },
    achievements: { value: "5", change: 3 },
    nextPayment: { value: "$50.00", dueIn: "Due in 7 days" },
  });
  // Initialize with default events
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([
    {
      id: ensureUniqueId('default-event-1'),
      title: 'Parent-Teacher Meeting',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '15:00',
      type: 'primary' as const,
      location: 'Main Hall',
      description: 'Discuss your child\'s progress'
    },
    {
      id: ensureUniqueId('default-event-2'),
      title: 'Summer Festival',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '10:00',
      type: 'primary' as const,
      location: 'Kindergarten Playground',
      description: 'Annual summer celebration with games and food'
    }
  ]);
  // Initialize with default activities
  const [recentActivities, setRecentActivities] = useState<any[]>([
    {
      id: ensureUniqueId('default-activity-1'),
      title: 'Painting Class',
      description: 'Your child completed a painting with watercolors',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: <BookOpen className="h-4 w-4" />,
      type: 'success'
    },
    {
      id: ensureUniqueId('default-activity-2'),
      title: 'Story Time',
      description: 'Your child participated in reading classic children stories',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: <BookOpen className="h-4 w-4" />,
      type: 'success'
    }
  ]);

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

  // We'll move this useEffect after the function definitions

  // Fetch dashboard data with optimized parallel requests and caching
  useEffect(() => {
    // Always run this effect to ensure cards render
    const CACHE_DURATION = 60000; // 1 minute cache
    const now = Date.now();
    const isCacheValid = now - dataCache.lastFetched < CACHE_DURATION;

    // Set initial loading state
    if (!isCacheValid) {
      setIsLoading(true);
    }

    // We'll set default data in the fetchDashboardData function

    const fetchDashboardData = async () => {
      console.log('Fetching dashboard data...');

      // Set default data immediately to ensure cards render
      if (recentActivities.length === 0) {
        processActivitiesData([], childId || '');
      }

      if (upcomingEvents.length === 0) {
        processEventsData([]);
      }
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

        // 1. Fetch activities data
        if (childId) {
          // If we have a specific child ID, fetch activities for that child
          console.log('Fetching activities for child ID:', childId);
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
        } else {
          // Otherwise, fetch all parent-visible activities
          console.log('Fetching all parent-visible activities');
          const activitiesPromise = getParentActivities()
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching parent activities:", error);
                return null;
              }
              activitiesData = data;
              processActivitiesData(data, '');
              return data;
            });
          promises.push(activitiesPromise);
        }

        // 2. Fetch events data (only those visible to parents)
        console.log('Fetching events data...');
        const eventsPromise = (user?.id
          ? getParentEvents(user.id) // Use the new parent-specific function
          : getEvents(true)) // Fallback to the old function with visibility filter
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
          console.log('Fetching payments data for user ID:', user.id);
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
      console.log('Processing activities data:', activitiesData);

      if (!activitiesData || activitiesData.length === 0) {
        console.log('No activities data to process, using default data');

        // Set default stats
        setStats(prev => ({
          ...prev,
          activities: {
            value: "3",
            change: 1
          },
          // Placeholder for attendance and achievements until we have real data
          attendance: { value: "92%", change: 2.5 },
          achievements: { value: "5", change: 3 }
        }));

        // Set default activities
        const defaultActivities = [
          {
            id: ensureUniqueId('default-activity-1'),
            title: 'Painting Class',
            description: `${actualChildName} completed a painting with watercolors`,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            icon: <BookOpen className="h-4 w-4" />,
            type: 'success'
          },
          {
            id: ensureUniqueId('default-activity-2'),
            title: 'Story Time',
            description: `${actualChildName} participated in reading classic children stories`,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            icon: <BookOpen className="h-4 w-4" />,
            type: 'success'
          },
          {
            id: ensureUniqueId('default-activity-3'),
            title: 'Music and Movement',
            description: `${actualChildName} enjoyed dancing and singing to children songs`,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            icon: <BookOpen className="h-4 w-4" />,
            type: 'success'
          }
        ];

        console.log('Setting default activities:', defaultActivities);
        setRecentActivities(defaultActivities);
        return;
      }

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
      const recentActs = activitiesData.slice(0, 3).map((activity: any, index: number) => {
        // Safely parse the date
        let timestamp;
        try {
          if (activity.activity_date) {
            timestamp = new Date(activity.activity_date);
            // Check if the date is valid
            if (isNaN(timestamp.getTime())) {
              console.warn(`Invalid date for activity: ${activity.activity_id || index}`, activity.activity_date);
              timestamp = new Date(); // Fallback to current date
            }
          } else {
            console.warn(`Missing date for activity: ${activity.activity_id || index}`);
            timestamp = new Date(); // Fallback to current date
          }
        } catch (error) {
          console.error(`Error parsing date for activity: ${activity.activity_id || index}`, error);
          timestamp = new Date(); // Fallback to current date
        }

        return {
          id: ensureUniqueId(activity.id || activity.activity_id, `activity-${index}-`),
          title: activity.title || activity.activity_name || 'Activity Completed',
          description: `${actualChildName} completed ${activity.description || activity.activity_description || 'an activity'}`,
          timestamp,
          icon: <BookOpen className="h-4 w-4" />,
          type: 'success'
        };
      });

      console.log('Setting recent activities:', JSON.stringify(recentActs, null, 2));
      setRecentActivities(recentActs);
    };

    // Helper function to process events data
    const processEventsData = (eventsData: any[]) => {
      console.log('Processing events data:', eventsData);

      if (!eventsData || eventsData.length === 0) {
        console.log('No events data to process, using default data');

        // Set default events
        const defaultEvents = [
          {
            id: ensureUniqueId('default-event-1'),
            title: 'Parent-Teacher Meeting',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            time: '15:00',
            type: 'primary' as const,
            location: 'Main Hall',
            description: 'Discuss your child\'s progress'
          },
          {
            id: ensureUniqueId('default-event-2'),
            title: 'Summer Festival',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            time: '10:00',
            type: 'primary' as const,
            location: 'Kindergarten Playground',
            description: 'Annual summer celebration with games and food'
          },
          {
            id: ensureUniqueId('default-event-3'),
            title: 'Art Exhibition',
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            time: '14:00',
            type: 'primary' as const,
            location: 'Art Room',
            description: 'Display of children\'s artwork'
          }
        ];

        console.log('Setting default upcoming events:', defaultEvents);
        setUpcomingEvents(defaultEvents);
        return;
      }

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

      console.log('Setting upcoming events:', JSON.stringify(upcomingEvts, null, 2));
      setUpcomingEvents(upcomingEvts);
    };

    // Helper function to process payments data
    const processPaymentsData = (paymentsData: any[]) => {
      console.log('Processing payments data:', paymentsData);

      if (!paymentsData || paymentsData.length === 0) {
        console.log('No payments data to process, using default data');

        // Set default payment stats
        setStats(prev => ({
          ...prev,
          nextPayment: {
            value: '$50.00',
            dueIn: 'Due in 7 days'
          }
        }));

        return;
      }

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

          console.log('Updated next payment stats:', { amount: nextPayment.amount, daysUntilDue });
        } catch (dateError) {
          console.error("Error calculating payment due date:", dateError);
        }
      } else {
        console.log('No upcoming payments found');

        // Set default payment stats if no upcoming payments
        setStats(prev => ({
          ...prev,
          nextPayment: {
            value: '$0.00',
            dueIn: 'No payments due'
          }
        }));
      }
    };

    fetchDashboardData();
  }, [childId, user?.id, actualChildName, showNotification, dataCache.lastFetched]);

  // Initialize default data on component mount
  useEffect(() => {
    console.log('Initializing default data...');
    // Just ensure loading state is false
    setIsLoading(false);
    // The default data is already set in the initial state
  }, []);  // Empty dependency array - run once on mount

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
              {/* Upcoming Events - Force render with key */}
              <DashboardCard
                key={`calendar-card-${Date.now()}`}
                title="Upcoming Events"
                icon={<Calendar className="h-5 w-5" />}
                animate
                animationDelay={500}
                isLoading={false} /* Force isLoading to false */
              >
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => (
                      <EventCard
                        key={ensureUniqueId(event.id, `event-${index}-`)}
                        event={{
                          ...event,
                          id: ensureUniqueId(event.id, `event-${index}-`)
                        }}
                        onClick={() => handleEventClick(event)}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  )}
                  <Button variant="outline" className="w-full">View All Events</Button>
                </div>
              </DashboardCard>

              {/* Recent Activities - Force render with key */}
              <ActivityCard
                key={`activities-card-${Date.now()}`}
                title="Recent Activities"
                activities={recentActivities}
                emptyMessage="No recent activities"
                animate
                animationDelay={600}
                onViewAll={() => console.log('View all activities')}
                isLoading={false} /* Force isLoading to false */
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
