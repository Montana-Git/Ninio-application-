import React from "react";
import { Link } from "react-router-dom";
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
import { LogIn, Menu, X, Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface NavbarProps {
  transparent?: boolean;
  onOpenAssistant?: () => void;
}

const Navbar = ({ transparent = false, onOpenAssistant }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
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
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className={logoClasses}>
          Ninio Kindergarten
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={linkClasses}>
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={linkClasses}>
                  Facilities
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
                            Our Facilities
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore our modern, safe, and engaging learning
                            environments designed for young minds.
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
                  Philosophy
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/programs" className={linkClasses}>
                  Programs
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
            {onOpenAssistant && (
              <Button
                variant={transparent && !isScrolled ? "outline" : "secondary"}
                className={cn("gap-2", {
                  "border-white text-white hover:bg-white hover:text-foreground":
                    transparent && !isScrolled,
                })}
                onClick={onOpenAssistant}
              >
                <Bot className="h-4 w-4" />
                Assistant
              </Button>
            )}
            <Link to="/auth/login">
              <Button
                variant={transparent && !isScrolled ? "outline" : "default"}
                className={cn({
                  "border-white text-white hover:bg-white hover:text-foreground":
                    transparent && !isScrolled,
                })}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button
                variant={transparent && !isScrolled ? "secondary" : "default"}
              >
                Register
              </Button>
            </Link>
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
                <span className="font-bold text-lg">Ninio Kindergarten</span>
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
                    Home
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/facilities"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    Facilities
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/philosophy"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    Philosophy
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/programs"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    Programs
                  </Link>
                </SheetClose>
                {onOpenAssistant && (
                  <SheetClose asChild>
                    <Button
                      className="w-full gap-2 justify-start"
                      variant="outline"
                      onClick={onOpenAssistant}
                    >
                      <Bot className="h-4 w-4" />
                      AI Assistant
                    </Button>
                  </SheetClose>
                )}
              </nav>
              <div className="mt-auto space-y-4 py-6">
                <SheetClose asChild>
                  <Link to="/auth/login" className="w-full">
                    <Button className="w-full">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/auth/register" className="w-full">
                    <Button variant="outline" className="w-full">
                      Register
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

const ListItem = React.forwardRef<
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
