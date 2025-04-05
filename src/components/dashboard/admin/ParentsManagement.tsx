import { useState, useEffect } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PlusCircle,
  Pencil,
  Trash2,
  User as UserIcon,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Import the User type from API
import { User } from "@/lib/api";

// Define the Parent type (extends User with additional properties)
interface Parent extends User {
  children_count?: number;
  status?: "active" | "inactive";
}

interface ParentsManagementProps {
  parents?: Parent[];
}

// Form schema for adding/editing parents
const parentFormSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  status: z.enum(["active", "inactive"]).default("active"),
  send_welcome_email: z.boolean().default(true),
});

const ParentsManagement = ({ parents = [] }: ParentsManagementProps) => {
  const { toast } = useToast();
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [parentsList, setParentsList] = useState<Parent[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Create form for adding parents
  const form = useForm<z.infer<typeof parentFormSchema>>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      status: "active",
      send_welcome_email: true,
    },
  });

  // Create form for editing parents
  const editForm = useForm<z.infer<typeof parentFormSchema>>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      status: "active",
      send_welcome_email: false,
    },
  });

  // Fetch parents from the API
  useEffect(() => {
    const fetchParents = async () => {
      setIsLoadingParents(true);
      try {
        const { data, error } = await getUsers("parent");
        if (error) throw error;

        if (data) {
          // Transform data to include status if not present
          const parentsWithStatus = data.map(parent => ({
            ...parent,
            children_count: parent.children_count || 0, // Use the count from API or default to 0
            status: parent.status || "active" as const // Default status
          }));
          console.log('Parents with children counts:', parentsWithStatus);
          setParentsList(parentsWithStatus);
          setIsLoadingParents(false); // Make sure to set loading to false
        }
      } catch (error) {
        console.error('Error fetching parents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load parents. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingParents(false);
      }
    };

    fetchParents();
  }, [toast]);

  // Handle adding a new parent
  const handleAddParent = async (data: z.infer<typeof parentFormSchema>) => {
    try {
      // Create parent in the database
      const { error } = await addUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: "parent",
      }, data.send_welcome_email);

      if (error) throw error;

      // Refresh parents list
      const { data: updatedParents } = await getUsers("parent");
      if (updatedParents) {
        setParentsList(updatedParents);
      }

      setIsAddParentOpen(false);
      form.reset();

      toast({
        title: 'Success',
        description: 'Parent added successfully',
      });
    } catch (error) {
      console.error('Error adding parent:', error);
      toast({
        title: 'Error',
        description: 'Failed to add parent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle editing a parent
  const handleEditParent = async (data: z.infer<typeof parentFormSchema>) => {
    if (!currentParent) return;

    try {
      // Update parent in the database
      const { error } = await updateUser(currentParent.id, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });

      if (error) throw error;

      // Refresh parents list
      const { data: updatedParents } = await getUsers("parent");
      if (updatedParents) {
        setParentsList(updatedParents);
      }

      setIsEditParentOpen(false);
      setCurrentParent(null);
      editForm.reset();

      toast({
        title: 'Success',
        description: 'Parent updated successfully',
      });
    } catch (error) {
      console.error('Error updating parent:', error);
      toast({
        title: 'Error',
        description: 'Failed to update parent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a parent
  const handleDeleteParent = async (id: string) => {
    try {
      // Delete parent from the database
      const { error } = await deleteUser(id);
      if (error) throw error;

      // Update local state
      setParentsList(parentsList.filter((parent) => parent.id !== id));

      toast({
        title: 'Success',
        description: 'Parent deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete parent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog with parent data
  const openEditDialog = (parent: Parent) => {
    setCurrentParent(parent);
    editForm.reset({
      first_name: parent.first_name || "",
      last_name: parent.last_name || "",
      email: parent.email,
      status: parent.status || "active",
      send_welcome_email: false,
    });
    setIsEditParentOpen(true);
  };

  // Filter parents based on search term and active tab
  const filteredParents = parentsList.filter((parent) => {
    const matchesSearch =
      parent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && parent.status !== "inactive";
    if (activeTab === "inactive") return matchesSearch && parent.status === "inactive";

    return matchesSearch;
  });

  return (
    <div className="w-full p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Parents Management</h2>
        <Dialog open={isAddParentOpen} onOpenChange={setIsAddParentOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Add New Parent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddParent)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="send_welcome_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send Welcome Email</FormLabel>
                        <FormDescription>
                          Send an email with login instructions to the parent
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Parent</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Search parents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoadingParents ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredParents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParents.map((parent) => (
              <Card key={parent.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${parent.first_name}`}
                          alt={`${parent.first_name} ${parent.last_name}`}
                        />
                        <AvatarFallback>
                          {parent.first_name.charAt(0)}
                          {parent.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {parent.first_name} {parent.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          {parent.email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={parent.status === "inactive" ? "outline" : "default"}>
                      {parent.status || "active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {parent.children_count || 0} {(parent.children_count || 0) === 1 ? "child" : "children"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-end space-x-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(parent)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteParent(parent.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <p className="mb-4">No parents found. {searchTerm && "Try a different search term."}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoadingParents(true);
                getUsers("parent").then(({ data }) => {
                  if (data) {
                    const parentsWithStatus = data.map(parent => ({
                      ...parent,
                      children_count: parent.children_count || 0,
                      status: parent.status || "active" as const
                    }));
                    setParentsList(parentsWithStatus);
                  }
                  setIsLoadingParents(false);
                });
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        )}
      </div>

      {/* Edit Parent Dialog */}
      <Dialog open={isEditParentOpen} onOpenChange={setIsEditParentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditParent)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Parent</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentsManagement;
