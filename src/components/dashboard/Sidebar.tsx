import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  CreditCard,
  BookOpen,
  Settings,
  LogOut,
  User,
  Activity,
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

interface SidebarProps {
  userName?: string;
  userRole?: "parent" | "admin";
  userAvatar?: string;
}

const Sidebar = ({
  userName = "Jane Doe",
  userRole = "parent",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
}: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  const parentMenuItems = [
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
  ];

  const adminMenuItems = [
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
                        <span className="mr-3">{item.icon}</span>
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
                  <Link to="/settings">
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
                  <Link to="/">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <span className="mr-3">
                        <LogOut size={20} />
                      </span>
                      Logout
                    </Button>
                  </Link>
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
