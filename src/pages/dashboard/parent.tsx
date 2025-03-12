import React from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/dashboard/Sidebar";
import ChildActivities from "@/components/dashboard/parent/ChildActivities";
import EventsCalendar from "@/components/dashboard/parent/EventsCalendar";
import PaymentSection from "@/components/dashboard/parent/PaymentSection";

interface ParentDashboardProps {
  userName?: string;
  childName?: string;
}

const ParentDashboard = ({
  userName = "Jane Doe",
  childName = "Emma",
}: ParentDashboardProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Parent Dashboard | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar userName={userName} userRole="parent" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {userName}
            </h1>
            <p className="text-gray-600">
              Here's what's happening with {childName} at Ninio Kindergarten
            </p>
          </div>

          <div className="space-y-8">
            {/* Child Activities Section */}
            <ChildActivities childName={childName} />

            {/* Events Calendar Section */}
            <EventsCalendar />

            {/* Payment Section */}
            <PaymentSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
