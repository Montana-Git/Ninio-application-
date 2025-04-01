import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Edit, Trash2, Search, Calendar, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ageGroup: string;
  parentName: string;
  allergies?: string;
  specialNotes?: string;
  avatarUrl?: string;
}

interface ChildrenManagementProps {
  children?: Child[];
}

const defaultChildren: Child[] = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Johnson",
    dateOfBirth: "2019-05-12",
    ageGroup: "3-4 years",
    parentName: "Jane Johnson",
    allergies: "Peanuts",
    specialNotes: "Needs extra attention during nap time",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
  {
    id: "2",
    firstName: "Noah",
    lastName: "Smith",
    dateOfBirth: "2018-09-23",
    ageGroup: "4-5 years",
    parentName: "Michael Smith",
    allergies: "None",
    specialNotes: "",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
  },
  {
    id: "3",
    firstName: "Olivia",
    lastName: "Williams",
    dateOfBirth: "2020-02-15",
    ageGroup: "2-3 years",
    parentName: "Sarah Williams",
    allergies: "Dairy",
    specialNotes: "Has a comfort toy (teddy bear)",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
  },
  {
    id: "4",
    firstName: "Liam",
    lastName: "Brown",
    dateOfBirth: "2019-11-30",
    ageGroup: "3-4 years",
    parentName: "David Brown",
    allergies: "None",
    specialNotes: "Shy with new people",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
  },
];

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  parentName: z.string().min(2, "Parent name is required"),
  allergies: z.string().optional(),
  specialNotes: z.string().optional(),
});

const ChildrenManagement: React.FC<ChildrenManagementProps> = ({
  children = defaultChildren,
}) => {
  const { t } = useTranslation();
  const [childrenList, setChildrenList] = useState<Child[]>(children);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState<Child | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      ageGroup: "",
      parentName: "",
      allergies: "",
      specialNotes: "",
    },
  });

  const filteredChildren = childrenList.filter(
    (child) =>
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddChild = (data: z.infer<typeof formSchema>) => {
    const newChild: Child = {
      id: Math.random().toString(36).substring(2, 9),
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      ageGroup: data.ageGroup,
      parentName: data.parentName,
      allergies: data.allergies,
      specialNotes: data.specialNotes,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
    };
    setChildrenList([...childrenList, newChild]);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleEditChild = (data: z.infer<typeof formSchema>) => {
    if (!currentChild) return;

    const updatedChildren = childrenList.map((child) =>
      child.id === currentChild.id
        ? {
            ...child,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            ageGroup: data.ageGroup,
            parentName: data.parentName,
            allergies: data.allergies,
            specialNotes: data.specialNotes,
          }
        : child,
    );

    setChildrenList(updatedChildren);
    setIsEditDialogOpen(false);
    setCurrentChild(null);
    form.reset();
  };

  const handleDeleteChild = () => {
    if (!currentChild) return;

    const updatedChildren = childrenList.filter(
      (child) => child.id !== currentChild.id,
    );

    setChildrenList(updatedChildren);
    setIsDeleteDialogOpen(false);
    setCurrentChild(null);
  };

  const openEditDialog = (child: Child) => {
    setCurrentChild(child);
    form.reset({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      ageGroup: child.ageGroup,
      parentName: child.parentName,
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
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parent name" {...field} />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("admin.children.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
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
                    : t("admin.children.noChildren")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
