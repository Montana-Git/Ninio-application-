import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: "holiday" | "activity" | "meeting";
  description: string;
}

interface EventsCalendarProps {
  events?: Event[];
}

const EventsCalendar = ({ events = [] }: EventsCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Default events if none provided
  const defaultEvents: Event[] = [
    {
      id: "1",
      title: "Parent-Teacher Meeting",
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      type: "meeting",
      description:
        "Discuss your child's progress and development goals for the upcoming term.",
    },
    {
      id: "2",
      title: "Art Exhibition",
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: "activity",
      description:
        "Children will showcase their artwork created throughout the month.",
    },
    {
      id: "3",
      title: "Spring Break",
      date: new Date(new Date().setDate(new Date().getDate() + 14)),
      type: "holiday",
      description: "Kindergarten will be closed for spring break.",
    },
    {
      id: "4",
      title: "Science Day",
      date: new Date(new Date().setDate(new Date().getDate() + 10)),
      type: "activity",
      description:
        "Interactive science experiments and demonstrations for all children.",
    },
    {
      id: "5",
      title: "Staff Development Day",
      date: new Date(new Date().setDate(new Date().getDate() + 21)),
      type: "holiday",
      description: "Kindergarten closed for staff professional development.",
    },
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  // Get events for the current month
  const currentMonthEvents = displayEvents.filter((event) => {
    return (
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  });

  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingEvents = displayEvents
    .filter((event) => {
      return event.date >= today && event.date <= nextWeek;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "holiday":
        return "bg-red-100 text-red-800 border-red-200";
      case "activity":
        return "bg-green-100 text-green-800 border-green-200";
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full h-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="lg:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Events Calendar</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const prevMonth = new Date(date);
                      prevMonth.setMonth(date.getMonth() - 1);
                      setDate(prevMonth);
                    }}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const nextMonth = new Date(date);
                      nextMonth.setMonth(date.getMonth() + 1);
                      setDate(nextMonth);
                    }}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                View and manage upcoming kindergarten events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
              />

              <div className="mt-6">
                <h3 className="font-medium mb-2">Events this month:</h3>
                {currentMonthEvents.length > 0 ? (
                  <div className="space-y-2">
                    {currentMonthEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.date)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getEventBadgeColor(event.type)}>
                          {event.type.charAt(0).toUpperCase() +
                            event.type.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No events scheduled for this month.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Section */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-md border hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={getEventBadgeColor(event.type)}>
                          {event.type.charAt(0).toUpperCase() +
                            event.type.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(event.date)}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="font-medium text-gray-700">
                    No upcoming events
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    There are no events scheduled for the next 7 days.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Events
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedEvent.date)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <Badge
                    className={`${getEventBadgeColor(selectedEvent.type)} mr-2`}
                  >
                    {selectedEvent.type.charAt(0).toUpperCase() +
                      selectedEvent.type.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
                <div className="pt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button>Add to Calendar</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsCalendar;
