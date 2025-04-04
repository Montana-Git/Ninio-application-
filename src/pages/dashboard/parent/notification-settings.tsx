import { useEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationService, NotificationPreferences } from '@/services/notification-service';
import Sidebar from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Calendar, DollarSign, RefreshCw, CheckCircle } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-card';

const NotificationSettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: user?.id || '',
    emailNotifications: true,
    activityUpdates: true,
    paymentReminders: true,
    eventReminders: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await NotificationService.getNotificationPreferences(user.id);
      
      if (error) throw error;
      
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load notification preferences',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const { success, error } = await NotificationService.updateNotificationPreferences(preferences);
      
      if (error) throw error;
      
      if (success) {
        setSaveSuccess(true);
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Notification preferences saved successfully',
        });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save notification preferences',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Notification Settings | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar userName={user?.first_name} userRole="parent" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {t('parent.notificationSettings.title', 'Notification Settings')}
            </h1>
            <p className="text-gray-600">
              {t('parent.notificationSettings.subtitle', 'Manage how and when you receive notifications')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AnimatedCard
                title="Notification Preferences"
                description="Choose which notifications you want to receive"
                animation="fade-in"
                className="h-full"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={() => handleToggle('emailNotifications')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-secondary/10 text-secondary">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <Label htmlFor="activityUpdates" className="text-base">Activity Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive updates about your child's activities</p>
                      </div>
                    </div>
                    <Switch
                      id="activityUpdates"
                      checked={preferences.activityUpdates}
                      onCheckedChange={() => handleToggle('activityUpdates')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-warning/10 text-warning">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <Label htmlFor="paymentReminders" className="text-base">Payment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Receive reminders about upcoming payments</p>
                      </div>
                    </div>
                    <Switch
                      id="paymentReminders"
                      checked={preferences.paymentReminders}
                      onCheckedChange={() => handleToggle('paymentReminders')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-info/10 text-info">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <Label htmlFor="eventReminders" className="text-base">Event Reminders</Label>
                        <p className="text-sm text-muted-foreground">Receive reminders about upcoming events</p>
                      </div>
                    </div>
                    <Switch
                      id="eventReminders"
                      checked={preferences.eventReminders}
                      onCheckedChange={() => handleToggle('eventReminders')}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSavePreferences}
                    disabled={isLoading || isSaving}
                    className="w-full md:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Saved!
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </AnimatedCard>
            </div>
            
            <div>
              <AnimatedCard
                title="About Notifications"
                animation="fade-in"
                delay={0.2}
              >
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Notifications help you stay updated about your child's activities, upcoming events, and important announcements.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications directly to your email inbox. This is useful for important announcements and updates.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Activity Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Stay informed about your child's daily activities, achievements, and learning progress.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming payments, invoices, and payment confirmations.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Event Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming events, parent-teacher meetings, and school activities.
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
