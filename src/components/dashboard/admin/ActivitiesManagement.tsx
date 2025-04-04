import { useState } from "react";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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

interface Activity {
  id: string;
  name: string;
  description: string;
  ageGroup: string;
  duration: string;
  date: string;
  imageUrl?: string;
}

interface ActivitiesManagementProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    name: "Finger Painting",
    description:
      "Creative art session where children use finger paints to create colorful artwork.",
    ageGroup: "3-4 years",
    duration: "45 minutes",
    date: "2023-06-15",
    imageUrl:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
  },
  {
    id: "2",
    name: "Story Time",
    description:
      "Interactive storytelling session with picture books and puppets.",
    ageGroup: "2-5 years",
    duration: "30 minutes",
    date: "2023-06-16",
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
  },
  {
    id: "3",
    name: "Outdoor Play",
    description:
      "Supervised playtime in the outdoor playground with various equipment.",
    ageGroup: "3-5 years",
    duration: "60 minutes",
    date: "2023-06-17",
    imageUrl:
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&q=80",
  },
];

const ActivitiesManagement: React.FC<ActivitiesManagementProps> = ({
  activities = defaultActivities,
}) => {
  const [activityList, setActivityList] = useState<Activity[]>(activities);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  const form = useForm<Omit<Activity, "id">>({});

  const filteredActivities = activityList.filter(
    (activity) =>
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddActivity = (data: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
    };
    setActivityList([...activityList, newActivity]);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleEditActivity = (data: Omit<Activity, "id">) => {
    if (!currentActivity) return;

    const updatedActivities = activityList.map((activity) =>
      activity.id === currentActivity.id ? { ...activity, ...data } : activity,
    );

    setActivityList(updatedActivities);
    setIsEditDialogOpen(false);
    setCurrentActivity(null);
    form.reset();
  };

  const handleDeleteActivity = () => {
    if (!currentActivity) return;

    const updatedActivities = activityList.filter(
      (activity) => activity.id !== currentActivity.id,
    );

    setActivityList(updatedActivities);
    setIsDeleteDialogOpen(false);
    setCurrentActivity(null);
  };

  const openEditDialog = (activity: Activity) => {
    setCurrentActivity(activity);
    form.reset({
      name: activity.name,
      description: activity.description,
      ageGroup: activity.ageGroup,
      duration: activity.duration,
      date: activity.date,
      imageUrl: activity.imageUrl,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (activity: Activity) => {
    setCurrentActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Activities Management
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new activity for the
                kindergarten.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddActivity)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter activity name" {...field} />
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
                          placeholder="Enter activity description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 3-5 years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 45 minutes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a URL for an image representing this activity.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Save Activity</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableCaption>List of kindergarten activities</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {activity.imageUrl && (
                      <img
                        src={activity.imageUrl}
                        alt={activity.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    )}
                    <span>{activity.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {activity.description}
                </TableCell>
                <TableCell>{activity.ageGroup}</TableCell>
                <TableCell>{activity.duration}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(activity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(activity)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                No activities found. Add a new activity to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>
              Update the details of the selected activity.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditActivity)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter activity name" {...field} />
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
                        placeholder="Enter activity description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Group</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 3-5 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 45 minutes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL for an image representing this activity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Update Activity</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the activity "
              {currentActivity?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteActivity}>
              Delete Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivitiesManagement;
