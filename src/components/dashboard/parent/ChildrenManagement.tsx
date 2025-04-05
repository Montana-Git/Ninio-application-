import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { getChildren, addChild, updateChild } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { User, Plus, Edit, Trash, AlertCircle } from "lucide-react";
import { format } from "date-fns";

// Define the form schema for adding/editing a child
const childFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  dateOfBirth: z.string().refine((date) => {
    try {
      return new Date(date) <= new Date();
    } catch {
      return false;
    }
  }, { message: "Date of birth must be in the past." }),
  allergies: z.string().optional(),
  specialNotes: z.string().optional(),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

const ChildrenManagement = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);

  // Initialize form for adding a child
  const addForm = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: format(new Date(), "yyyy-MM-dd"),
      allergies: "",
      specialNotes: "",
    },
  });

  // Initialize form for editing a child
  const editForm = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      allergies: "",
      specialNotes: "",
    },
  });

  // Fetch children on component mount
  useEffect(() => {
    fetchChildren();
  }, [user?.id]);

  // Fetch children from API
  const fetchChildren = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await getChildren(user.id);
      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast({
        title: "Error",
        description: "Failed to load children. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new child
  const handleAddChild = async (values: ChildFormValues) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User information not available. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format the data according to the API expectations
      const childData = {
        parent_id: user.id,
        first_name: values.firstName,
        last_name: values.lastName,
        date_of_birth: values.dateOfBirth,
        allergies: values.allergies || "",
        special_notes: values.specialNotes || "",
      };

      console.log("Adding child with data:", childData);

      const { data, error } = await addChild(childData);

      if (error) {
        console.error("API returned error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from API");
      }

      console.log("Child added successfully:", data);

      // Add the new child to the list
      setChildren((prev) => [...prev, data]);

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      addForm.reset();

      toast({
        title: "Success",
        description: "Child added successfully!",
      });

      // Refresh the children list to ensure we have the latest data
      fetchChildren();

    } catch (error: any) {
      console.error("Error adding child:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to add child. Please try again.";

      if (error.code === "PGRST301" || error.status === 403) {
        errorMessage = "Permission denied. You don't have permission to add a child. Please contact support.";
      } else if (error.code === "PGRST404" || error.status === 404) {
        errorMessage = "The API endpoint was not found. Please check your connection.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a child
  const handleEditChild = async (values: ChildFormValues) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User information not available. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedChild) {
      toast({
        title: "Error",
        description: "No child selected for editing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format the data according to the API expectations
      const childData = {
        parent_id: user.id,
        first_name: values.firstName,
        last_name: values.lastName,
        date_of_birth: values.dateOfBirth,
        allergies: values.allergies || "",
        special_notes: values.specialNotes || "",
      };

      console.log("Updating child with ID:", selectedChild.id, "Data:", childData);

      const { data, error } = await updateChild(selectedChild.id, childData);

      if (error) {
        console.error("API returned error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from API");
      }

      console.log("Child updated successfully:", data);

      // Update the child in the list
      setChildren((prev) =>
        prev.map((child) => (child.id === selectedChild.id ? data : child))
      );

      // Close dialog and reset form
      setIsEditDialogOpen(false);
      setSelectedChild(null);

      toast({
        title: "Success",
        description: "Child updated successfully!",
      });

      // Refresh the children list to ensure we have the latest data
      fetchChildren();

    } catch (error: any) {
      console.error("Error updating child:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to update child. Please try again.";

      if (error.code === "PGRST301" || error.status === 403) {
        errorMessage = "Permission denied. You don't have permission to update a child. Please contact support.";
      } else if (error.code === "PGRST404" || error.status === 404) {
        errorMessage = "The API endpoint was not found. Please check your connection.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit dialog and populate form with child data
  const openEditDialog = (child: any) => {
    setSelectedChild(child);
    editForm.reset({
      firstName: child.first_name,
      lastName: child.last_name,
      dateOfBirth: child.date_of_birth ? format(new Date(child.date_of_birth), "yyyy-MM-dd") : "",
      allergies: child.allergies || "",
      specialNotes: child.special_notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Children Information</CardTitle>
          <CardDescription>Manage your children's information</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Child
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Child</DialogTitle>
              <DialogDescription>
                Enter your child's information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addForm.handleSubmit(handleAddChild)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...addForm.register("firstName")}
                    />
                    {addForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500">
                        {addForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...addForm.register("lastName")}
                    />
                    {addForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500">
                        {addForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...addForm.register("dateOfBirth")}
                  />
                  {addForm.formState.errors.dateOfBirth && (
                    <p className="text-sm text-red-500">
                      {addForm.formState.errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (if any)</Label>
                  <Input
                    id="allergies"
                    placeholder="e.g., Peanuts, Dairy, etc."
                    {...addForm.register("allergies")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialNotes">Special Notes</Label>
                  <Textarea
                    id="specialNotes"
                    placeholder="Any special needs or additional information"
                    {...addForm.register("specialNotes")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Child"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading && children.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <h3 className="text-lg font-medium">Loading Children</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Please wait while we load your children's information...
            </p>
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Children Added</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              You haven't added any children yet. Click the "Add Child" button to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {children.map((child) => (
              <div key={child.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {child.first_name} {child.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Age: {calculateAge(child.date_of_birth)} years
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(child)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                {(child.allergies || child.special_notes) && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      {child.allergies && (
                        <div>
                          <h4 className="text-sm font-medium">Allergies</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {child.allergies}
                          </p>
                        </div>
                      )}
                      {child.special_notes && (
                        <div>
                          <h4 className="text-sm font-medium">Special Notes</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {child.special_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Child Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Child Information</DialogTitle>
              <DialogDescription>
                Update your child's information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleEditChild)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">First Name</Label>
                    <Input
                      id="edit-firstName"
                      {...editForm.register("firstName")}
                    />
                    {editForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500">
                        {editForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Last Name</Label>
                    <Input
                      id="edit-lastName"
                      {...editForm.register("lastName")}
                    />
                    {editForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500">
                        {editForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    {...editForm.register("dateOfBirth")}
                  />
                  {editForm.formState.errors.dateOfBirth && (
                    <p className="text-sm text-red-500">
                      {editForm.formState.errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-allergies">Allergies (if any)</Label>
                  <Input
                    id="edit-allergies"
                    placeholder="e.g., Peanuts, Dairy, etc."
                    {...editForm.register("allergies")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialNotes">Special Notes</Label>
                  <Textarea
                    id="edit-specialNotes"
                    placeholder="Any special needs or additional information"
                    {...editForm.register("specialNotes")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ChildrenManagement;
