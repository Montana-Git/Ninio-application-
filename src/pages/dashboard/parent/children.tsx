import { Helmet } from "react-helmet";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ChildrenManagement from "@/components/dashboard/parent/ChildrenManagement";
import { useAuth } from "@/contexts/AuthContext";
import DashboardAssistantButton from "@/components/ai/DashboardAssistantButton";

const ParentChildrenPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Children Management | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar
        userName={`${user?.first_name || ""} ${user?.last_name || ""}`}
        userRole="parent"
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || "User"}`}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader title="Children Management" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground mb-6">
              Manage your children's information, add new children, or update existing information.
            </p>
            <ChildrenManagement />
          </div>
        </main>
      </div>

      {/* Dashboard Assistant Button */}
      <DashboardAssistantButton />
    </div>
  );
};

export default ParentChildrenPage;
