import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import ActivitiesManagement from "@/components/dashboard/admin/ActivitiesManagement";
import EventsManagement from "@/components/dashboard/admin/EventsManagement";
import PaymentManagement from "@/components/dashboard/admin/PaymentManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, CreditCard, LayoutDashboard } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Admin user information
  const adminUser = {
    userName: "Admin User",
    userRole: "admin",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  };

  // Dashboard overview stats
  const dashboardStats = [
    {
      title: "Total Students",
      value: "42",
      icon: <Activity className="h-5 w-5 text-blue-500" />,
      change: "+2 this month",
      trend: "up",
    },
    {
      title: "Upcoming Events",
      value: "8",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      change: "Next: Parent-Teacher Meeting",
      trend: "neutral",
    },
    {
      title: "Pending Payments",
      value: "$1,250",
      icon: <CreditCard className="h-5 w-5 text-amber-500" />,
      change: "5 payments due",
      trend: "down",
    },
    {
      title: "Activities This Week",
      value: "12",
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      change: "+3 from last week",
      trend: "up",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        userName={adminUser.userName}
        userRole={adminUser.userRole}
        userAvatar={adminUser.userAvatar}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage kindergarten activities, events, and payments
            </p>
          </div>

          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-3xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {dashboardStats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {stat.title}
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {stat.value}
                          </h3>
                          <p
                            className={`text-xs mt-1 ${stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"}`}
                          >
                            {stat.change}
                          </p>
                        </div>
                        <div className="p-2 rounded-full bg-gray-100">
                          {stat.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Recent Activities
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Finger Painting",
                          date: "Today",
                          ageGroup: "3-4 years",
                        },
                        {
                          name: "Story Time",
                          date: "Yesterday",
                          ageGroup: "2-5 years",
                        },
                        {
                          name: "Outdoor Play",
                          date: "2 days ago",
                          ageGroup: "3-5 years",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{activity.name}</h4>
                            <p className="text-sm text-gray-500">
                              {activity.ageGroup}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {activity.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Upcoming Events
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Parent-Teacher Meeting",
                          date: "June 15, 2023",
                          location: "Main Hall",
                        },
                        {
                          title: "Summer Festival",
                          date: "July 20, 2023",
                          location: "Kindergarten Playground",
                        },
                        {
                          title: "Art Exhibition",
                          date: "August 5, 2023",
                          location: "Art Room",
                        },
                      ].map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {event.location}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {event.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <ActivitiesManagement />
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <EventsManagement />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <PaymentManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
