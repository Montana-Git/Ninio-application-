import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Edit, Trash2, Search, Calendar, Info, Loader2, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { getChildren, addChild, updateChild, deleteChild, getUsers } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for the admin view of a child
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ageGroup: string;
  parentName: string;
  parentId: string;
  allergies?: string;
  specialNotes?: string;
  avatarUrl?: string;
}

interface ChildrenManagementProps {
  children?: Child[];
}

// Map from database format to admin view format
const mapDbChildToAdminView = async (dbChild: any, parents: any[]): Promise<Child> => {
  // Find the parent in the parents list
  const parent = parents.find(p => p.id === dbChild.parent_id) || { first_name: 'Unknown', last_name: 'Parent' };

  return {
    id: dbChild.id,
    firstName: dbChild.first_name,
    lastName: dbChild.last_name,
    dateOfBirth: dbChild.date_of_birth,
    ageGroup: dbChild.age_group,
    parentId: dbChild.parent_id,
    parentName: `${parent.first_name} ${parent.last_name}`,
    allergies: dbChild.allergies || '',
    specialNotes: dbChild.special_notes || '',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbChild.first_name}`,
  };
};

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  parentId: z.string().min(1, "Parent is required"),
  allergies: z.string().optional(),
  specialNotes: z.string().optional(),
});

const ChildrenManagement: React.FC<ChildrenManagementProps> = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [parentsList, setParentsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      ageGroup: "",
      parentId: "",
      allergies: "",
      specialNotes: "",
    },
  });

  // Function to fetch children and parents data
  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Fetch parents first
      const { data: parentsData, error: parentsError } = await getUsers("parent");

      if (parentsError) {
        throw new Error(`Error fetching parents: ${parentsError.message}`);
      }

      console.log('Parents data:', parentsData);
      setParentsList(parentsData || []);

      // Then fetch all children
      const { data: childrenData, error: childrenError } = await getChildren();

      if (childrenError) {
        throw new Error(`Error fetching children: ${childrenError.message}`);
      }

      console.log('Children data:', childrenData);

      if (childrenData && parentsData) {
        // Map database children to admin view format
        const mappedChildren = await Promise.all(
          (childrenData || []).map(child => mapDbChildToAdminView(child, parentsData))
        );

        console.log('Mapped children:', mappedChildren);
        setChildrenList(mappedChildren);
      } else {
        console.log('No children or parents data available');
        setChildrenList([]);
      }

      // Update last refreshed timestamp
      setLastRefreshed(new Date());

      if (!isInitialLoad) {
        toast({
          title: "Data Refreshed",
          description: "Children data has been refreshed.",
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load children data. Please try again.",
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
    fetchData(true);

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 30000); // 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const filteredChildren = childrenList.filter(
    (child) =>
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddChild = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Find the parent to get their ID
      const parent = parentsList.find(p => p.id === data.parentId);

      if (!parent) {
        throw new Error("Parent not found");
      }

      // Format data for API
      const childData = {
        parent_id: data.parentId,
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        age_group: data.ageGroup,
        allergies: data.allergies || "",
        special_notes: data.specialNotes || "",
      };

      // Call API to add child
      const { data: newData, error } = await addChild(childData);

      if (error) {
        throw error;
      }

      if (!newData) {
        throw new Error("No data returned from API");
      }

      // Map the returned data to our format
      const newChild = await mapDbChildToAdminView(newData, parentsList);

      // Update state
      setChildrenList([...childrenList, newChild]);
      setIsAddDialogOpen(false);
      form.reset();

      toast({
        title: "Success",
        description: "Child added successfully",
      });

      // Refresh data to ensure we have the latest
      fetchData(false);
    } catch (error: any) {
      console.error("Error adding child:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add child",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChild = async (data: z.infer<typeof formSchema>) => {
    if (!currentChild) return;

    setIsLoading(true);
    try {
      // Format data for API
      const childData = {
        parent_id: data.parentId,
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        age_group: data.ageGroup,
        allergies: data.allergies || "",
        special_notes: data.specialNotes || "",
      };

      // Call API to update child
      const { data: updatedData, error } = await updateChild(currentChild.id, childData);

      if (error) {
        throw error;
      }

      if (!updatedData) {
        throw new Error("No data returned from API");
      }

      // Map the returned data to our format
      const updatedChild = await mapDbChildToAdminView(updatedData, parentsList);

      // Update state
      setChildrenList(
        childrenList.map((child) =>
          child.id === currentChild.id ? updatedChild : child
        )
      );

      setIsEditDialogOpen(false);
      setCurrentChild(null);
      form.reset();

      toast({
        title: "Success",
        description: "Child updated successfully",
      });

      // Refresh data to ensure we have the latest
      fetchData(false);
    } catch (error: any) {
      console.error("Error updating child:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update child",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!currentChild) return;

    setIsLoading(true);
    try {
      // Call API to delete child
      const { data, error } = await deleteChild(currentChild.id);

      if (error) {
        throw error;
      }

      // Update state
      setChildrenList(childrenList.filter((child) => child.id !== currentChild.id));
      setIsDeleteDialogOpen(false);
      setCurrentChild(null);

      toast({
        title: "Success",
        description: "Child deleted successfully",
      });

      // Refresh data to ensure we have the latest
      fetchData(false);
    } catch (error: any) {
      console.error("Error deleting child:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete child",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (child: Child) => {
    setCurrentChild(child);
    form.reset({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      ageGroup: child.ageGroup,
      parentId: child.parentId,
      allergies: child.allergies || "",
      specialNotes: child.specialNotes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (child: Child) => {
    setCurrentChild(child);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (child: Child) => {
    setCurrentChild(child);
    setIsViewDialogOpen(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          {t("admin.children.title")}
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              {t("admin.children.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] sm:w-auto">
            <DialogHeader>
              <DialogTitle>{t("admin.children.add")}</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new child to the kindergarten.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddChild)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.register.firstName")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.register.lastName")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select age group</option>
                            <option value="2-3 years">2-3 years</option>
                            <option value="3-4 years">3-4 years</option>
                            <option value="4-5 years">4-5 years</option>
                            <option value="5-6 years">5-6 years</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select parent</option>
                          {parentsList.map((parent) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.first_name} {parent.last_name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter allergies or 'None'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any special notes or requirements"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
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
                  <Button type="submit">Add Child</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("admin.children.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading children data...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          <Table>
            <TableCaption>
              List of children enrolled in the kindergarten
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead className="hidden md:table-cell">Age</TableHead>
                <TableHead className="hidden sm:table-cell">Parent</TableHead>
                <TableHead className="hidden lg:table-cell">Allergies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChildren.length > 0 ? (
              filteredChildren.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {child.avatarUrl && (
                        <img
                          src={child.avatarUrl}
                          alt={`${child.firstName} ${child.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div>{`${child.firstName} ${child.lastName}`}</div>
                        <div className="text-xs text-gray-500">
                          {child.ageGroup}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span>{formatDate(child.dateOfBirth)}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({calculateAge(child.dateOfBirth)} years)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {child.parentName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {child.allergies && child.allergies !== "None" ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {child.allergies}
                      </div>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openViewDialog(child)}
                            >
                              <Info className="h-4 w-4 text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(child)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit child</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(child)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete child</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  {searchTerm
                    ? "No children found matching your search."
                    : (
                      <div className="flex flex-col items-center py-4">
                        <p className="mb-4">No children found. Please add children using the 'Add Child' button above.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchData(false)}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh Data
                        </Button>
                      </div>
                    )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      )}

      {/* View Child Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Child Details</DialogTitle>
          </DialogHeader>
          {currentChild && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {currentChild.avatarUrl && (
                  <img
                    src={currentChild.avatarUrl}
                    alt={`${currentChild.firstName} ${currentChild.lastName}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {`${currentChild.firstName} ${currentChild.lastName}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentChild.ageGroup}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </h4>
                  <p>{formatDate(currentChild.dateOfBirth)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Age</h4>
                  <p>{calculateAge(currentChild.dateOfBirth)} years</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Parent</h4>
                  <p>{currentChild.parentName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Allergies
                  </h4>
                  <p>
                    {currentChild.allergies && currentChild.allergies !== "None"
                      ? currentChild.allergies
                      : "None"}
                  </p>
                </div>
              </div>

              {currentChild.specialNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Special Notes
                  </h4>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                    {currentChild.specialNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Child Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Edit Child</DialogTitle>
            <DialogDescription>
              Update the details for this child.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditChild)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Group</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select age group</option>
                          <option value="2-3 years">2-3 years</option>
                          <option value="3-4 years">3-4 years</option>
                          <option value="4-5 years">4-5 years</option>
                          <option value="5-6 years">5-6 years</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this child? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {currentChild && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-md">
              {currentChild.avatarUrl && (
                <img
                  src={currentChild.avatarUrl}
                  alt={`${currentChild.firstName} ${currentChild.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium">{`${currentChild.firstName} ${currentChild.lastName}`}</p>
                <p className="text-sm text-gray-500">{currentChild.ageGroup}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChild}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildrenManagement;
