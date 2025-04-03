import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { getChildActivities } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category: string;
}

interface ChildActivitiesProps {
  childName?: string;
  childId?: string;
}

const ChildActivities = ({
  childName = "Emma",
  childId,
}: ChildActivitiesProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // If childId is provided, use it; otherwise, try to get activities for the first child of the parent
        const targetChildId = childId || (user?.children_names && user.children_names.length > 0 ? user.children_names[0] : undefined);
        
        if (targetChildId) {
          const { data, error } = await getChildActivities(targetChildId);
          if (error) throw new Error(error.message);
          if (data) {
            setActivities(data.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              date: item.date,
              time: item.time || "All day",
              location: item.location,
              imageUrl: item.image_url || "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80",
              category: item.category || "Activity",
            })));
          }
        } else {
          // Fallback to mock data if no child ID is available
          setActivities([
            {
              id: "1",
              title: "Art & Craft Session",
              description:
                "Children created colorful paper collages and learned about different shapes and colors.",
              date: "2023-06-15",
              time: "10:00 AM - 11:30 AM",
              location: "Art Room",
              imageUrl:
                "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80",
              category: "Creative",
            },
            {
              id: "2",
              title: "Outdoor Play",
              description:
                "Children enjoyed playground activities including slides, swings, and group games.",
              date: "2023-06-14",
              time: "2:00 PM - 3:00 PM",
              location: "Playground",
              imageUrl:
                "https://images.unsplash.com/photo-1597430203889-c93cce4aaa47?w=600&q=80",
              category: "Physical",
            },
            {
              id: "3",
              title: "Story Time",
              description:
                'Interactive reading session with puppets and role play based on "The Very Hungry Caterpillar".',
              date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
              time: "9:30 AM - 10:15 AM",
              location: "Reading Corner",
              imageUrl:
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
              category: "Literacy",
            },
            {
              id: "4",
              title: "Music & Movement",
              description:
                "Children learned simple rhythms and movements with percussion instruments.",
              date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days in future
              time: "11:00 AM - 12:00 PM",
              location: "Music Room",
              imageUrl:
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
              category: "Music",
            },
          ]);
        }
      } catch (err: any) {
        console.error("Error fetching activities:", err);
        setError("Failed to load activities. Please try again later.");
        // Fallback to empty array
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [childId, user]);

  // Sort activities by date (most recent first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Group activities by upcoming and recent
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingActivities = sortedActivities.filter(
    (activity) => new Date(activity.date) >= today,
  );

  const recentActivities = sortedActivities.filter(
    (activity) => new Date(activity.date) < today,
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white p-4 sm:p-6 rounded-xl flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white p-4 sm:p-6 rounded-xl">
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
          <button 
            className="mt-2 text-primary hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          {childName}'s Activities
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          View your child's recent and upcoming activities
        </p>
      </div>

      {/* Upcoming Activities */}
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Upcoming Activities
        </h3>
        {upcomingActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                formatDate={formatDate}
                isUpcoming={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm sm:text-base">
            No upcoming activities scheduled
          </p>
        )}
      </div>

      {/* Recent Activities */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Recent Activities
        </h3>
        {recentActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                formatDate={formatDate}
                isUpcoming={false}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm sm:text-base">
            No recent activities to display
          </p>
        )}
      </div>
    </div>
  );
};

interface ActivityCardProps {
  activity: Activity;
  formatDate: (date: string) => string;
  isUpcoming: boolean;
}

const ActivityCard = ({
  activity,
  formatDate,
  isUpcoming,
}: ActivityCardProps) => {
  const { title, description, date, time, location, imageUrl, category } =
    activity;

  const handleAddToCalendar = () => {
    // Create calendar event
    const eventTitle = encodeURIComponent(title);
    const eventDetails = encodeURIComponent(description);
    const eventLocation = encodeURIComponent(location);
    
    // Parse date and time
    const [startTime] = time.split(' - ');
    const [hours, minutes] = startTime.match(/(\d+):(\d+)/)?.slice(1) || ['9', '00'];
    const isPM = startTime.toLowerCase().includes('pm');
    let hour = parseInt(hours);
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    const eventDate = new Date(date);
    eventDate.setHours(hour, parseInt(minutes));
    
    // End time is 1 hour later by default
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1);
    
    const startDateStr = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${startDateStr}/${endDateStr}`;
    
    // Open in new tab
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden h-full border-gray-200">
      <div className="relative h-36 sm:h-48 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <Badge
          variant={isUpcoming ? "default" : "secondary"}
          className="absolute top-3 right-3"
        >
          {category}
        </Badge>
      </div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(date)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
          {description}
        </p>
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{time}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-6 pt-0 sm:pt-0">
        {isUpcoming && (
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            onClick={handleAddToCalendar}
          >
            Add to calendar
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChildActivities;
