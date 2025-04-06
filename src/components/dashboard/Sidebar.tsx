import { forwardRef } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import {
  Home,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  User,
  Users,
  Activity,
  Upload,
  BarChart2,
  Bell,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface SidebarProps {
  userName?: string;
  userRole?: "parent" | "admin";
  userAvatar?: string;
}

// Logout button component
const LogoutButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log('Logging out...');
      // First clear local storage to ensure all session data is removed
      localStorage.clear();
      sessionStorage.clear();

      // Then call the signOut function
      await signOut();
      console.log('Logout successful, navigating to login page');

      // Force a small delay to ensure signOut completes
      setTimeout(() => {
        // Use window.location for a full page refresh to clear any remaining state
        window.location.href = '/auth/login';
      }, 100);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if there was an error
      window.location.href = '/auth/login';
    }
  };

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleLogout}
      {...props}
    >
      <span className="mr-3">
        <LogOut size={20} />
      </span>
      Logout
    </Button>
  );
});

LogoutButton.displayName = "LogoutButton";

const Sidebar = ({
  userName,
  userRole,
  userAvatar,
}: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);
  const { unreadCount } = useNotification();
  const { user } = useAuth();

  // Use props if provided, otherwise fall back to user context
  const displayName = userName || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
  const displayRole = userRole || user?.role || 'parent';
  const displayAvatar = userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`;


  const parentMenuItems: MenuItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard/parent" },
    {
      icon: <Activity size={20} />,
      label: "Activities",
      path: "/dashboard/parent/activities",
    },
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      path: "/dashboard/parent/calendar",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Payments",
      path: "/dashboard/parent/payments",
    },
    {
      icon: <Users size={20} />,
      label: "Children",
      path: "/dashboard/parent/children",
    },
    {
      icon: <Upload size={20} />,
      label: "Files",
      path: "/dashboard/parent/files",
    },
    {
      icon: <BarChart2 size={20} />,
      label: "Reports",
      path: "/dashboard/parent/reports",
    },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      path: "/dashboard/parent/notification-settings",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      path: "/dashboard/parent/profile",
    },
  ];

  const adminMenuItems: MenuItem[] = [
    { icon: <User size={20} />, label: "Profile", path: "/dashboard/admin/profile" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/admin/settings" },
  ];

  const menuItems = displayRole === "admin" ? adminMenuItems : parentMenuItems;

  return (
    <div className="h-full w-[250px] bg-background border-r flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback>
            {displayName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium text-lg">{displayName}</h3>
        <p className="text-muted-foreground text-sm capitalize">{displayRole}</p>
      </div>

      <Separator />

      {/* Navigation Menu - Only show full menu for parent users */}
      {displayRole === "parent" && (
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={item.path} onClick={() => {
                        // If this is the payments link, scroll to the payments section
                        if (item.label === "Payments") {
                          setTimeout(() => {
                            const paymentsSection = document.getElementById("payments-section");
                            if (paymentsSection) {
                              paymentsSection.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 100);
                        }
                      }}>
                        <Button
                          variant={isActive(item.path) ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive(item.path) ? "bg-secondary" : "",
                          )}
                        >
                          <span className="mr-3 relative">
                            {item.icon}
                            {item.badge && (
                              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                                {(item.badge ?? 0) > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </span>
                          {item.label}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Admin Profile Menu - Simplified for admin users */}
      {displayRole === "admin" && (
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="font-medium text-sm uppercase text-muted-foreground mb-3">Account</h3>
            <ul className="space-y-2">
              {adminMenuItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive(item.path) ? "bg-secondary" : "",
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-sm uppercase text-muted-foreground mb-3">Quick Links</h3>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Use the tabs above to navigate between different admin sections.</p>
              <p>This sidebar is for your profile and account settings only.</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button - For both user types */}
      <div className="p-4 mt-auto border-t">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <LogoutButton />
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
