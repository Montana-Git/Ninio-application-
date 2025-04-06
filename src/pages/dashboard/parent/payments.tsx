import { Helmet } from "react-helmet";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import PaymentSection from "@/components/dashboard/parent/PaymentSection";
import { useAuth } from "@/contexts/AuthContext";
import DashboardAssistantButton from "@/components/ai/DashboardAssistantButton";
import { useEffect, useState } from "react";
import { getChildren } from "@/lib/api";

const ParentPaymentsPage = () => {
  const { user } = useAuth();
  const [childName, setChildName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch child name for the payment section
  useEffect(() => {
    const fetchChildName = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await getChildren(user.id);
        
        if (error) {
          console.error("Error fetching children:", error);
          return;
        }
        
        if (data && data.length > 0) {
          // Use the first child's name
          const firstChild = data[0];
          setChildName(`${firstChild.first_name} ${firstChild.last_name}`);
        }
      } catch (error) {
        console.error("Error in fetchChildName:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChildName();
  }, [user?.id]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Payments | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader title="Payments" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6" id="payments-section">
          <div className="max-w-6xl mx-auto">
            <p className="text-muted-foreground mb-6">
              Manage your payments, view payment history, and make new payments.
            </p>
            <PaymentSection childName={childName} />
          </div>
        </main>
      </div>

      {/* Dashboard Assistant Button */}
      <DashboardAssistantButton />
    </div>
  );
};

export default ParentPaymentsPage;
