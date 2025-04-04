
import { Helmet } from "react-helmet";
import Sidebar from "@/components/dashboard/Sidebar";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { useAuth } from "@/contexts/AuthContext";

const AdminProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Helmet>
        <title>Profile Settings | Ninio Kindergarten Admin</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar
        userName={`${user?.first_name || ""} ${user?.last_name || ""}`}
        userRole="admin"
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || "Admin"}`}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ProfileSettings userRole="admin" />
      </div>
    </div>
  );
};

export default AdminProfilePage;
