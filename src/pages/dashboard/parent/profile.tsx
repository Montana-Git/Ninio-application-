import React from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/dashboard/Sidebar";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { useAuth } from "@/contexts/AuthContext";

const ParentProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Profile Settings | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar
        userName={`${user?.first_name || ""} ${user?.last_name || ""}`}
        userRole="parent"
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || "User"}`}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ProfileSettings userRole="parent" />
      </div>
    </div>
  );
};

export default ParentProfilePage;
