
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Calendar, FileText, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface User {
  name: string;
  email: string;
  role: "student" | "teacher";
}

const MainNavbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
    setIsAuthenticated(false);
    setUser(null);
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Review My Project</span>
          </Link>
        </div>
        
        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {user.role === "student" ? (
                <>
                  <Link to="/student/dashboard" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/student/dashboard" && "text-primary"
                  )}>
                    Dashboard
                  </Link>
                  <Link to="/student/projects" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/student/projects" && "text-primary"
                  )}>
                    My Projects
                  </Link>
                  <Link to="/student/appointments" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/student/appointments" && "text-primary"
                  )}>
                    Appointments
                  </Link>
                  <Link to="/student/profile" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/student/profile" && "text-primary"
                  )}>
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/teacher/dashboard" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/teacher/dashboard" && "text-primary"
                  )}>
                    Dashboard
                  </Link>
                  <Link to="/teacher/projects" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/teacher/projects" && "text-primary"
                  )}>
                    Projects
                  </Link>
                  <Link to="/teacher/appointments" className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === "/teacher/appointments" && "text-primary"
                  )}>
                    Appointments
                  </Link>
                </>
              )}
            </nav>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs font-medium text-primary capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "student" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/student/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/student/projects")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Projects</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/student/appointments")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Appointments</span>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "teacher" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/teacher/projects")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Review Projects</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/teacher/appointments")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Appointments</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate(`/${user.role}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/auth?tab=register")}>
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default MainNavbar;
