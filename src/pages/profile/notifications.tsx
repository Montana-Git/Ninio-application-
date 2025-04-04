import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import ProfileLayout from '@/components/layout/ProfileLayout';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Notification settings
  const [settings, setSettings] = useState({
    email_notifications: {
      activities: true,
      events: true,
      payments: true,
      announcements: true,
      newsletters: true
    },
    sms_notifications: {
      activities: false,
      events: true,
      payments: true,
      announcements: false,
      newsletters: false
    },
    push_notifications: {
      activities: true,
      events: true,
      payments: true,
      announcements: true,
      newsletters: false
    }
  });

  useEffect(() => {
    // In a real implementation, fetch notification settings from API
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // This would be replaced with actual data from API
      setIsLoading(false);
    }, 1000);
  }, [user]);

  const handleToggle = (category, type) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, save settings to API
      // const { error } = await updateNotificationSettings(user.id, settings);
      // if (error) throw error;
      
      setMessage({ type: 'success', text: 'Notification settings updated successfully' });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage({ type: 'error', text: 'Failed to update notification settings' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        
        <div className="mb-8">
          <p className="text-gray-700 mb-4">
            Manage how you receive notifications about activities, events, payments, and more.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SMS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Push
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Child Activities</div>
                    <div className="text-sm text-gray-500">Updates about your child's daily activities</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.email_notifications.activities}
                        onChange={() => handleToggle('email_notifications', 'activities')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.sms_notifications.activities}
                        onChange={() => handleToggle('sms_notifications', 'activities')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.push_notifications.activities}
                        onChange={() => handleToggle('push_notifications', 'activities')}
                      />
                    </label>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Events</div>
                    <div className="text-sm text-gray-500">Upcoming events and calendar reminders</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.email_notifications.events}
                        onChange={() => handleToggle('email_notifications', 'events')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.sms_notifications.events}
                        onChange={() => handleToggle('sms_notifications', 'events')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.push_notifications.events}
                        onChange={() => handleToggle('push_notifications', 'events')}
                      />
                    </label>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Payments</div>
                    <div className="text-sm text-gray-500">Payment reminders and receipts</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.email_notifications.payments}
                        onChange={() => handleToggle('email_notifications', 'payments')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.sms_notifications.payments}
                        onChange={() => handleToggle('sms_notifications', 'payments')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.push_notifications.payments}
                        onChange={() => handleToggle('push_notifications', 'payments')}
                      />
                    </label>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Announcements</div>
                    <div className="text-sm text-gray-500">Important kindergarten announcements</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.email_notifications.announcements}
                        onChange={() => handleToggle('email_notifications', 'announcements')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.sms_notifications.announcements}
                        onChange={() => handleToggle('sms_notifications', 'announcements')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.push_notifications.announcements}
                        onChange={() => handleToggle('push_notifications', 'announcements')}
                      />
                    </label>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Newsletters</div>
                    <div className="text-sm text-gray-500">Monthly newsletters and updates</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.email_notifications.newsletters}
                        onChange={() => handleToggle('email_notifications', 'newsletters')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.sms_notifications.newsletters}
                        onChange={() => handleToggle('sms_notifications', 'newsletters')}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={settings.push_notifications.newsletters}
                        onChange={() => handleToggle('push_notifications', 'newsletters')}
                      />
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default NotificationsPage;
