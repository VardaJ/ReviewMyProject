import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Calendar, FileText } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface DashboardStat {
  title: string;
  value: number;
  description: string;
  icon: JSX.Element;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

const StudentDashboard = () => {
  const [stats, setStats] = useState<DashboardStat[]>([
    {
      title: "Total Projects",
      value: 0,
      description: "Total number of projects submitted",
      icon: <Upload className="h-5 w-5 text-primary" />,
    },
    {
      title: "Appointments",
      value: 0,
      description: "Total scheduled appointments",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
    },
  ]);

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user data
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User not found. Please log in again.');
        }
        const userData = JSON.parse(userString);

        // Fetch user's projects
        const projectsResponse = await axios.get(`/api/projects/user/${userData.id}`);
        const projects = projectsResponse.data;

        // Update stats
        setStats(prevStats => 
          prevStats.map(stat => 
            stat.title === "Total Projects" 
              ? { ...stat, value: projects.length } 
              : stat
          )
        );

        // Create activities from projects
        const recentActivities = projects.slice(0, 5).map(project => ({
          id: project._id,
          type: 'submission',
          title: project.projectTitle,
          description: `Project submitted: ${project.groupName}`,
          date: project.createdAt
        }));

        setActivities(recentActivities);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "submission":
        return <Upload className="h-5 w-5 text-primary" />;
      case "feedback":
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MainLayout allowedRole="student">
        <div className="container py-12">
          <div className="w-full flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout allowedRole="student">
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Dashboard</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout allowedRole="student">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your projects and activities
            </p>
          </div>
          <Button onClick={() => navigate("/student/projects/new")}>Submit New Project</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="glass-card animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card h-full animate-slide-up">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent project submissions and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 items-start border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-2">No recent activities</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/student/projects/new")}>
                    Submit Your First Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
