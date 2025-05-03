
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Upload, Calendar, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        navigate(user.role === "student" ? "/student/dashboard" : "/teacher/dashboard");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Project Approval</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/auth?tab=register")}>
              Sign up
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Review My Project
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect students and teachers in a simplified workflow for project submissions, reviews, and discussions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" onClick={() => navigate("/auth?tab=register")}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-center text-base font-medium">Submit Projects</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Upload and submit projects for teacher approval
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-center text-base font-medium">Teacher Feedback</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Receive detailed feedback on your submissions
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-center text-base font-medium">Schedule Meetings</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Book discussion slots with teachers
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-primary/10 p-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-center text-base font-medium">Track Progress</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Monitor project approval status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Get Started Today
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simplify your project approval process
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform connects students and teachers in a streamlined workflow for project submissions, reviews, and discussions.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate("/auth?tab=register")}>
                Create an Account
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between md:py-8">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Project Approval. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <a className="hover:underline" href="#">Terms of Service</a>
            <a className="hover:underline" href="#">Privacy</a>
            <a className="hover:underline" href="#">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
