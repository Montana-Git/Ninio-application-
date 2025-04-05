
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

      {/* Sidebar - now gets user info from AuthContext */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ProfileSettings userRole="parent" />
      </div>
    </div>
  );
};

export default ParentProfilePage;
