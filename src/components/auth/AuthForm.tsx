import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

type UserRole = "student" | "teacher";

const getRegisteredUsers = () => {
  const storedUsers = localStorage.getItem("registeredUsers");
  return storedUsers ? JSON.parse(storedUsers) : [];
};

const saveRegisteredUser = (user: { email: string; password: string; role: UserRole; name: string }) => {
  const users = getRegisteredUsers();
  if (!users.some((u: any) => u.email === user.email)) {
    users.push(user);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    return true;
  }
  return false;
};

const validateUser = (email: string, password: string) => {
  const users = getRegisteredUsers();
  return users.find((user: any) => user.email === email && user.password === password);
};

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>("student");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, isLogin: boolean) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string || "";

    try {
      setTimeout(() => {
        setIsLoading(false);

        if (isLogin) {
          const user = validateUser(email, password);
          
          if (user) {
            localStorage.setItem("user", JSON.stringify({
              email,
              role: user.role,
              name: user.name,
              id: user.id || uuidv4()
            }));
            localStorage.setItem("isAuthenticated", "true");
            
            toast({
              title: "Login successful!",
              description: `Welcome to the ${user.role} dashboard`,
            });
            
            navigate(user.role === "student" ? "/student/dashboard" : "/teacher/dashboard");
          } else {
            toast({
              variant: "destructive",
              title: "Authentication failed",
              description: "Invalid email or password",
            });
          }
        } else {
          const newUser = {
            email,
            password,
            role,
            name,
            id: Math.random().toString(36).substring(2)
          };
          
          const registered = saveRegisteredUser(newUser);
          
          if (registered) {
            localStorage.setItem("user", JSON.stringify({
              email,
              role,
              name,
              id: newUser.id
            }));
            localStorage.setItem("isAuthenticated", "true");
            
            toast({
              title: "Registration successful!",
              description: `Welcome to the ${role} dashboard`,
            });
            
            navigate(role === "student" ? "/student/dashboard" : "/teacher/dashboard");
          } else {
            toast({
              variant: "destructive",
              title: "Registration failed",
              description: "This email is already registered",
            });
          }
        }
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="glass-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Review My Project</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <div className="flex justify-center mb-4">
              <div className="flex items-center border rounded-lg p-1 gap-1">
                <Button 
                  variant={role === "student" ? "default" : "outline"} 
                  className="text-xs h-8 px-3 rounded-md"
                  onClick={() => setRole("student")}
                >
                  Student
                </Button>
                <Button 
                  variant={role === "teacher" ? "default" : "outline"} 
                  className="text-xs h-8 px-3 rounded-md"
                  onClick={() => setRole("teacher")}
                >
                  Teacher
                </Button>
              </div>
            </div>
            
            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, true)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm text-primary underline-offset-4 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      type="text"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
