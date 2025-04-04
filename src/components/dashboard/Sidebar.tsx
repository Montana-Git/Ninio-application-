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

  const handleLogout = async () => {
    await signOut();
    navigate("/auth/login");
  };

  return (
    <Button
      ref={ref}
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
  userName = "Jane Doe",
  userRole = "parent",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
}: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);
  const { unreadCount } = useNotification();

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
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard/admin" },
    {
      icon: <Activity size={20} />,
      label: "Activities",
      path: "/dashboard/admin/activities",
    },
    {
      icon: <Calendar size={20} />,
      label: "Events",
      path: "/dashboard/admin/events",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Payments",
      path: "/dashboard/admin/payments",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      path: "/dashboard/admin/profile",
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : parentMenuItems;

  return (
    <div className="h-full w-[250px] bg-background border-r flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium text-lg">{userName}</h3>
        <p className="text-muted-foreground text-sm capitalize">{userRole}</p>
      </div>

      <Separator />

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.path}>
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

      {/* Settings and Logout */}
      <div className="p-4 mt-auto border-t">
        <ul className="space-y-2">
          <li>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={
                      userRole === "admin"
                        ? "/dashboard/admin/profile"
                        : "/dashboard/parent/profile"
                    }
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      <span className="mr-3">
                        <Settings size={20} />
                      </span>
                      Settings
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
          <li>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <LogoutButton />
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
