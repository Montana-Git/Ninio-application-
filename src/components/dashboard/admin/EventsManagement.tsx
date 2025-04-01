import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  PlusCircle,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  location: string;
}

interface EventsManagementProps {
  events?: Event[];
}

const EventsManagement = ({ events = [] }: EventsManagementProps) => {
  // Default mock data if no events are provided
  const defaultEvents: Event[] = [
    {
      id: "1",
      title: "Parent-Teacher Meeting",
      date: new Date(2023, 5, 15),
      time: "15:00",
      description: "Quarterly meeting to discuss student progress",
      location: "Main Hall",
    },
    {
      id: "2",
      title: "Summer Festival",
      date: new Date(2023, 6, 20),
      time: "10:00",
      description: "Annual summer celebration with games and performances",
      location: "Kindergarten Playground",
    },
    {
      id: "3",
      title: "Art Exhibition",
      date: new Date(2023, 7, 5),
      time: "13:30",
      description: "Showcasing children's artwork from the semester",
      location: "Art Room",
    },
  ];

  const [eventsList, setEventsList] = useState<Event[]>(
    events.length ? events : defaultEvents,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      date: new Date(),
      time: "",
      description: "",
      location: "",
    },
  });

  const editForm = useForm({
    defaultValues: {
      title: "",
      date: new Date(),
      time: "",
      description: "",
      location: "",
    },
  });

  // Filter events for the selected date
  const eventsForSelectedDate = selectedDate
    ? eventsList.filter(
        (event) =>
          event.date.getDate() === selectedDate.getDate() &&
          event.date.getMonth() === selectedDate.getMonth() &&
          event.date.getFullYear() === selectedDate.getFullYear(),
      )
    : [];

  // Handle adding a new event
  const handleAddEvent = (data: any) => {
    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      date: data.date || new Date(),
    };
    setEventsList([...eventsList, newEvent]);
    setIsAddEventOpen(false);
    form.reset();
  };

  // Handle editing an event
  const handleEditEvent = (data: any) => {
    if (currentEvent) {
      const updatedEvents = eventsList.map((event) =>
        event.id === currentEvent.id ? { ...event, ...data } : event,
      );
      setEventsList(updatedEvents);
      setIsEditEventOpen(false);
      setCurrentEvent(null);
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    const updatedEvents = eventsList.filter((event) => event.id !== id);
    setEventsList(updatedEvents);
  };

  // Open edit dialog with event data
  const openEditDialog = (event: Event) => {
    setCurrentEvent(event);
    editForm.reset({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      location: event.location,
    });
    setIsEditEventOpen(true);
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Events Management</h2>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] sm:w-auto">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddEvent)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        className="rounded-md border mx-auto w-full max-w-[350px]"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter event description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button type="submit" className="w-full sm:w-auto">
                    Save Event
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </h3>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border mx-auto w-full max-w-[350px]"
          />
        </div>

        {/* Events List */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              {selectedDate ? (
                <>Events for {selectedDate.toLocaleDateString()}</>
              ) : (
                <>All Events</>
              )}
            </h3>
          </div>

          {eventsForSelectedDate.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Time</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Location
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsForSelectedDate.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div>{event.title}</div>
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          {event.time}
                        </div>
                        <div className="md:hidden text-xs text-gray-500 mt-1">
                          {event.location}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {event.time}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {event.location}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No events scheduled for this date</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddEventOpen(true)}
              >
                Add Event
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditEvent)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      className="rounded-md border mx-auto w-full max-w-[350px]"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="submit" className="w-full sm:w-auto">
                  Update Event
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement;
