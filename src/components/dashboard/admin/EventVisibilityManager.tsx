import { useState, useEffect, useCallback } from "react";
import { Calendar, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getEvents, updateEventVisibility } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  visible_to_parents: boolean;
}

const EventVisibilityManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to fetch events
  const fetchEvents = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const { data, error } = await getEvents();

      if (error) {
        throw error;
      }

      if (data) {
        setEvents(data);
      }

      // Update last refreshed timestamp
      setLastRefreshed(new Date());

      if (!isInitialLoad) {
        toast({
          title: "Data Refreshed",
          description: "Events data has been refreshed.",
        });
      }
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events data. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  // Handle visibility toggle
  const handleVisibilityToggle = async (eventId: string, currentVisibility: boolean) => {
    try {
      const { data, error } = await updateEventVisibility(eventId, !currentVisibility);

      if (error) {
        throw error;
      }

      // Update the events list with the new visibility
      setEvents(
        events.map((event) =>
          event.id === eventId
            ? { ...event, visible_to_parents: !currentVisibility }
            : event
        )
      );

      toast({
        title: "Visibility Updated",
        description: `Event is now ${!currentVisibility ? "visible" : "hidden"} to parents.`,
      });
    } catch (error) {
      console.error("Error updating event visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update event visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Event Visibility Manager</CardTitle>
            <CardDescription>
              Control which events are visible to parents in their dashboard
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents(false)}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Loading events data...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No events found</p>
              <p className="text-sm text-muted-foreground">
                Add events to display them to parents
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={event.visible_to_parents ? "success" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {event.visible_to_parents ? (
                          <>
                            <Eye className="h-3 w-3" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Hidden
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={event.visible_to_parents}
                        onCheckedChange={() =>
                          handleVisibilityToggle(event.id, event.visible_to_parents)
                        }
                        aria-label="Toggle visibility"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventVisibilityManager;
