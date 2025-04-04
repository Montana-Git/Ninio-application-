import { useState, useEffect, forwardRef } from "react";

import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LogIn, Menu, X, Bot, User, Settings, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/container";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { User as UserType } from "@/lib/api";

interface NavbarProps {
  transparent?: boolean;
  onOpenAssistant?: () => void;
  user?: UserType | null;
}

const Navbar = ({ transparent = false, onOpenAssistant, user }: NavbarProps) => {
  const { t } = useTranslation();
  const { signOut, user: authUser } = useAuth();
  const navigate = useNavigate();

  // Use provided user or fallback to authUser from context
  const currentUser = user || authUser;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarClasses = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
    {
      "bg-white shadow-sm": !transparent || isScrolled,
      "bg-transparent": transparent && !isScrolled,
    },
  );

  const linkClasses = cn(
    "text-sm font-medium transition-colors hover:text-primary",
    {
      "text-foreground": !transparent || isScrolled,
      "text-white hover:text-white/80": transparent && !isScrolled,
    },
  );

  const logoClasses = cn("font-bold text-xl", {
    "text-primary": !transparent || isScrolled,
    "text-white": transparent && !isScrolled,
  });

  return (
    <header className={navbarClasses}>
      <Container className="h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className={logoClasses}>
          {t("app.name")}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={linkClasses}>
                  {t("nav.home")}
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(linkClasses, "bg-transparent", {
                    "text-foreground hover:text-primary":
                      !transparent || isScrolled,
                    "text-white hover:text-white/80":
                      transparent && !isScrolled,
                  })}
                >
                  {t("nav.facilities")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/facilities"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            {t("home.facilities.title")}
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            {t("home.facilities.description")}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/facilities/classrooms" title="Classrooms">
                      Bright, spacious classrooms equipped with learning
                      materials.
                    </ListItem>
                    <ListItem href="/facilities/playground" title="Playground">
                      Safe outdoor play areas with age-appropriate equipment.
                    </ListItem>
                    <ListItem
                      href="/facilities/activity-rooms"
                      title="Activity Rooms"
                    >
                      Specialized rooms for art, music, and physical activities.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/philosophy" className={linkClasses}>
                  {t("home.philosophy.title")}
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/programs" className={linkClasses}>
                  {t("nav.programs")}
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            {currentUser && <NotificationBell />}
            {/* Assistant button removed to avoid duplication with AppSidebar */}

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.first_name || "User"}`}
                        alt={currentUser.first_name}
                      />
                      <AvatarFallback>{currentUser.first_name?.charAt(0)}{currentUser.last_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.first_name} {currentUser.last_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={currentUser.role === "admin" ? "/dashboard/admin" : "/dashboard/parent"}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={currentUser.role === "admin" ? "/dashboard/admin/profile" : "/dashboard/parent/profile"}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/auth/login");
                    }}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button
                    variant={transparent && !isScrolled ? "outline" : "default"}
                    className={cn("font-medium", {
                      "border-white text-white hover:bg-white hover:text-foreground":
                        transparent && !isScrolled,
                    })}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button
                    variant={transparent && !isScrolled ? "secondary" : "default"}
                  >
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center py-4">
                <span className="font-bold text-lg">{t("app.name")}</span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-4 mt-8">
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    {t("nav.home")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/facilities"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    {t("nav.facilities")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/philosophy"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    {t("home.philosophy.title")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/programs"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    {t("nav.programs")}
                  </Link>
                </SheetClose>
                <div className="py-2 flex items-center space-x-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                  {currentUser && <NotificationBell />}
                </div>
                {/* Assistant button removed to avoid duplication with AppSidebar */}

                {currentUser && (
                  <>
                    <SheetClose asChild>
                      <Link to={currentUser.role === "admin" ? "/dashboard/admin" : "/dashboard/parent"} className="w-full">
                        <Button variant="outline" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to={currentUser.role === "admin" ? "/dashboard/admin/profile" : "/dashboard/parent/profile"} className="w-full">
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-500"
                        onClick={async () => {
                          await signOut();
                          navigate("/auth/login");
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </SheetClose>
                  </>
                )}
              </nav>
              <div className="mt-auto space-y-4 py-6">
                {!currentUser && (
                  <>
                    <SheetClose asChild>
                      <Link to="/auth/login" className="w-full">
                        <Button className="w-full">
                          <LogIn className="mr-2 h-4 w-4" />
                          {t("nav.login")}
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/auth/register" className="w-full">
                        <Button variant="outline" className="w-full">
                          {t("nav.register")}
                        </Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
};

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";

export default Navbar;
