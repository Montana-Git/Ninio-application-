import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { getChildActivities, getEvents, getParentPayments } from "@/lib/api";
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch activities data
        if (childId) {
          const { data: activitiesData, error: activitiesError } = await getChildActivities(childId);

          if (activitiesError) {
            console.error("Error fetching child activities:", activitiesError);
          } else if (activitiesData) {
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
          }
        }

        // Fetch events data
        const { data: eventsData, error: eventsError } = await getEvents();

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
        } else if (eventsData) {
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
        }

        // Fetch payment data
        if (user?.id) {
          const { data: paymentsData, error: paymentsError } = await getParentPayments(user.id);

          if (paymentsError) {
            console.error("Error fetching payments:", paymentsError);
          } else if (paymentsData && paymentsData.length > 0) {
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
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showNotification({
          title: "Error Loading Dashboard",
          message: "There was a problem loading your dashboard data. Please try refreshing the page.",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [childId, user?.id, actualChildName, showNotification]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Parent Dashboard | Ninio</title>
      </Helmet>

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader title="Parent Dashboard" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid gap-6">
            {/* Child Selector */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
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
              />
              <StatCard
                title="Attendance"
                value={stats.attendance.value}
                change={stats.attendance.change}
                icon={<Users className="h-8 w-8" />}
                animate
                animationDelay={200}
              />
              <StatCard
                title="Achievements"
                value={stats.achievements.value}
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
              />
            </div>

            {/* Payments Section */}
            <PaymentSection />
          </div>
        </main>
      </div>

      {/* Dashboard Assistant Button */}
      <DashboardAssistantButton />
    </div>
  );
}
