import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isSameDay, isSameMonth } from "date-fns";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Info,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getEvents, addEvent, updateEvent, deleteEvent, updateEventVisibility } from "@/lib/api";

// Define the Event type
interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  location: string;
  type?: 'holiday' | 'activity' | 'meeting';
  isPublic?: boolean;
  visibleToParents?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  color?: string;
  icon?: string;
  imageUrl?: string;
}

interface EventsManagementProps {
  events?: Event[];
}

// Form schema for adding/editing events
const eventFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean().default(true),
  visibleToParents: z.boolean().default(true),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  type: z.enum(['holiday', 'activity', 'meeting']).default('activity'),
  color: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
});

const EventsManagement = ({ events = [] }: EventsManagementProps) => {
  // We'll fetch events from the API instead of using mock data

  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Create form for adding events
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      time: "",
      description: "",
      location: "",
      isPublic: true,
      visibleToParents: true,
      status: 'upcoming',
      type: 'activity',
      color: "",
      icon: "",
      imageUrl: "",
    },
  });

  // Create form for editing events
  const editForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      time: "",
      description: "",
      location: "",
      isPublic: true,
      visibleToParents: true,
      status: 'upcoming',
      type: 'activity',
      color: "",
      icon: "",
      imageUrl: "",
    },
  });

  // Filter events for the selected date
  const eventsForSelectedDate = eventsList
    ? eventsList.filter(
        (event) =>
          isSameDay(event.date, selectedDate) &&
          isSameMonth(event.date, selectedDate) &&
          event.date.getFullYear() === selectedDate.getFullYear(),
      )
    : [];

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const { data, error } = await getEvents();
        if (error) throw error;

        if (data) {
          // Transform API data to match our Event type
          const formattedEvents = data.map((event: any) => ({
            id: event.id,
            title: event.title,
            date: new Date(event.date),
            time: event.time || '00:00',
            description: event.description || '',
            location: event.location || '',
            type: event.type || 'activity',
            isPublic: event.is_public || true,
            visibleToParents: event.visible_to_parents !== false,
            status: event.status || 'upcoming',
            color: event.color || '',
            icon: event.icon || '',
            imageUrl: event.image_url || ''
          }));

          setEventsList(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [toast]);

  // Handle adding a new event
  const handleAddEvent = async (data: any) => {
    try {
      // Create event in the database
      const { error } = await addEvent({
        title: data.title,
        date: data.date.toISOString().split('T')[0],
        time: data.time,
        description: data.description,
        location: data.location,
        type: data.type || 'activity',
        is_public: data.isPublic,
        visible_to_parents: data.visibleToParents,
        status: data.status || 'upcoming',
        color: data.color,
        icon: data.icon,
        image_url: data.imageUrl
      });

      if (error) throw error;

      // Refresh events list
      const { data: updatedEvents } = await getEvents();
      if (updatedEvents) {
        const formattedEvents = updatedEvents.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          time: event.time || '00:00',
          description: event.description || '',
          location: event.location || '',
          type: event.type || 'activity',
          isPublic: event.is_public || true
        }));

        setEventsList(formattedEvents);
      }

      setIsAddEventOpen(false);
      form.reset();

      toast({
        title: 'Success',
        description: 'Event added successfully',
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle editing an event
  const handleEditEvent = async (data: any) => {
    if (!currentEvent) return;

    try {
      // Update event in the database
      const { error } = await updateEvent(currentEvent.id, {
        title: data.title,
        date: data.date.toISOString().split('T')[0],
        time: data.time,
        description: data.description,
        location: data.location,
        type: data.type || currentEvent.type || 'activity',
        is_public: data.isPublic,
        visible_to_parents: data.visibleToParents,
        status: data.status || 'upcoming',
        color: data.color,
        icon: data.icon,
        image_url: data.imageUrl
      });

      if (error) throw error;

      // Refresh events list
      const { data: updatedEvents } = await getEvents();
      if (updatedEvents) {
        const formattedEvents = updatedEvents.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          time: event.time || '00:00',
          description: event.description || '',
          location: event.location || '',
          type: event.type || 'activity',
          isPublic: event.is_public || true,
          visibleToParents: event.visible_to_parents !== false,
          status: event.status || 'upcoming',
          color: event.color || '',
          icon: event.icon || '',
          imageUrl: event.image_url || ''
        }));

        setEventsList(formattedEvents);
      }

      setIsEditEventOpen(false);
      setCurrentEvent(null);
      editForm.reset();

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (id: string) => {
    try {
      // Delete event from the database
      const { error } = await deleteEvent(id);
      if (error) throw error;

      // Update local state
      setEventsList(eventsList.filter((event) => event.id !== id));

      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
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
      isPublic: event.isPublic,
      visibleToParents: event.visibleToParents,
      status: event.status || 'upcoming',
      type: event.type || 'activity',
      color: event.color || '',
      icon: event.icon || '',
      imageUrl: event.imageUrl || '',
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
          <DialogContent className="sm:max-w-[425px]">
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
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Event title" {...field} />
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
                      <FormLabel>Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
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
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
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
                        <Input placeholder="Event location" {...field} />
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
                        <Textarea
                          placeholder="Event description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Visible to Parents</FormLabel>
                        <FormDescription>
                          Make this event visible to parents in their dashboard
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visibleToParents"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Visible to Parents</FormLabel>
                        <FormDescription>
                          Make this event visible in the parent dashboard
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Event</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Calendar</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Events for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          {isLoadingEvents ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForSelectedDate.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="text-sm text-gray-500 mt-1 space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div className="flex items-center">
                            <Info className="h-3.5 w-3.5 mr-1" />
                            {event.description}
                          </div>
                        )}
                      </div>
                      {event.isPublic !== undefined && (
                        <Badge
                          variant={event.isPublic ? "default" : "outline"}
                          className="mt-2"
                        >
                          {event.isPublic ? "Public" : "Private"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No events scheduled for this date
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">All Upcoming Events</h3>
        {isLoadingEvents ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : eventsList.length > 0 ? (
          <Table>
            <TableCaption>List of all upcoming events</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsList
                .filter((event) => event.date >= new Date(new Date().setHours(0, 0, 0, 0)))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{format(event.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={event.isPublic ? "default" : "outline"}
                      >
                        {event.isPublic ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(event)}
                        >
                          <Pencil className="h-4 w-4" />
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            No upcoming events
          </div>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
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
                    <FormLabel>Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
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
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                      <Input placeholder="Event location" {...field} />
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
                      <Textarea
                        placeholder="Event description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Public Event</FormLabel>
                      <FormDescription>
                        Make this event public
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="visibleToParents"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Visible to Parents</FormLabel>
                      <FormDescription>
                        Make this event visible in the parent dashboard
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Event</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement;
