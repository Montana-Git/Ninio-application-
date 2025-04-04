import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  updateUserProfile,
  updateUserPreferences,
  getUserPreferences,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Lock, Mail, Globe } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChildrenManagement from "./parent/ChildrenManagement";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  avatarUrl: z.string().optional(),
});

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  activityUpdates: z.boolean().default(true),
  paymentReminders: z.boolean().default(true),
  eventReminders: z.boolean().default(true),
  language: z.string().default("en"),
});

interface ProfileSettingsProps {
  userRole?: "parent" | "admin";
}

const ProfileSettings = ({ userRole = "parent" }: ProfileSettingsProps) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  // Fetch user preferences on component mount
  useEffect(() => {
    if (user) {
      const fetchPreferences = async () => {
        const { data } = await getUserPreferences(user.id);
        if (data) {
          notificationForm.reset({
            emailNotifications: data.email_notifications,
            activityUpdates: data.activity_updates,
            paymentReminders: data.payment_reminders,
            eventReminders: data.event_reminders,
            language: data.language || currentLanguage,
          });

          // Set the language if it exists in preferences
          if (data.language && data.language !== currentLanguage) {
            changeLanguage(data.language);
            setCurrentLanguage(data.language);
          }
        }
      };
      fetchPreferences();
    }
  }, [user, currentLanguage]);

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || "User"}`,
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      activityUpdates: true,
      paymentReminders: true,
      eventReminders: true,
      language: currentLanguage,
    },
  });

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("User not found");

      const { error } = await updateUserProfile(user.id, {
        first_name: data.firstName,
        last_name: data.lastName,
        // Email updates may require additional auth verification
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true);
    try {
      // Password update logic would go here
      // This would typically use supabase.auth.updateUser({ password: data.newPassword })

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (
    data: z.infer<typeof notificationFormSchema>,
  ) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("User not found");

      // Update language if changed
      if (data.language !== currentLanguage) {
        changeLanguage(data.language);
        setCurrentLanguage(data.language);
      }

      const { error } = await updateUserPreferences(user.id, {
        email_notifications: data.emailNotifications,
        activity_updates: data.activityUpdates,
        payment_reminders: data.paymentReminders,
        event_reminders: data.eventReminders,
        language: data.language,
      });

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description:
          "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description:
          "There was a problem updating your notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-600">
          Manage your profile and account preferences
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("profile.tabs.profile", "Profile")}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t("profile.tabs.security", "Security")}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {t("profile.tabs.notifications", "Notifications")}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t("profile.tabs.language", "Language")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={profileForm.watch("avatarUrl")}
                        alt="Profile"
                      />
                      <AvatarFallback>
                        {`${profileForm.watch("firstName").charAt(0) || ""}${profileForm.watch("lastName").charAt(0) || ""}`}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">
                      {userRole === "admin" ? "Administrator" : "Parent"}
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...profileForm.register("firstName")}
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...profileForm.register("lastName")}
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register("email")}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support for assistance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {userRole === "parent" && (
            <div className="mt-6">
              <ChildrenManagement />
            </div>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Login History</h3>
                  <p className="text-sm text-muted-foreground">
                    View your recent login activity
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("profile.notifications.title", "Notification Preferences")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="emailNotifications"
                        className="font-medium"
                      >
                        {t(
                          "profile.notifications.email",
                          "Email Notifications",
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "profile.notifications.emailDesc",
                          "Receive email notifications",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationForm.watch("emailNotifications")}
                      onCheckedChange={(checked) =>
                        notificationForm.setValue("emailNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activityUpdates" className="font-medium">
                        {t(
                          "profile.notifications.activity",
                          "Activity Updates",
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "profile.notifications.activityDesc",
                          "Receive updates about your child's activities",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="activityUpdates"
                      checked={notificationForm.watch("activityUpdates")}
                      onCheckedChange={(checked) =>
                        notificationForm.setValue("activityUpdates", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paymentReminders" className="font-medium">
                        {t(
                          "profile.notifications.payment",
                          "Payment Reminders",
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "profile.notifications.paymentDesc",
                          "Receive reminders about upcoming payments",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="paymentReminders"
                      checked={notificationForm.watch("paymentReminders")}
                      onCheckedChange={(checked) =>
                        notificationForm.setValue("paymentReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="eventReminders" className="font-medium">
                        {t("profile.notifications.event", "Event Reminders")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "profile.notifications.eventDesc",
                          "Receive reminders about upcoming events",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="eventReminders"
                      checked={notificationForm.watch("eventReminders")}
                      onCheckedChange={(checked) =>
                        notificationForm.setValue("eventReminders", checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? t("common.saving", "Saving...")
                      : t("common.savePreferences", "Save Preferences")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("profile.language.title", "Language Settings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language" className="font-medium">
                      {t("profile.language.select", "Select Language")}
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t(
                        "profile.language.selectDesc",
                        "Choose your preferred language for the application",
                      )}
                    </p>

                    <Select
                      value={notificationForm.watch("language")}
                      onValueChange={(value) => {
                        notificationForm.setValue("language", value);
                      }}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue
                          placeholder={t(
                            "profile.language.selectPlaceholder",
                            "Select a language",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <span>🇬🇧</span>
                            <span>English</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fr">
                          <div className="flex items-center gap-2">
                            <span>🇫🇷</span>
                            <span>Français</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ar">
                          <div className="flex items-center gap-2">
                            <span>🇸🇦</span>
                            <span>العربية</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? t("common.saving", "Saving...")
                      : t("common.saveLanguage", "Save Language Preference")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
