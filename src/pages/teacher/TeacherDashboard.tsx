import axios, { InternalAxiosRequestConfig, AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, FileText, CheckCircle, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";

interface Project {
  _id: string;
  projectTitle: string;
  groupName: string;
  subject: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Appointment {
  _id: string;
  student: Student;
  groupNumber: string;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DashboardStat {
  title: string;
  value: number | string;
  description: string;
  icon: JSX.Element;
}

const TeacherDashboard = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create an axios instance with the base URL
  const apiInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:8080',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor to log requests
    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log('Making request to:', config.url);
        return config;
      },
      (error: AxiosError) => {
        console.error('Request error:', error.message);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for better error handling
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('Received response from:', response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
        
        // Check if it's a connection refused error
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please make sure the backend server is running.",
            variant: "destructive"
          });
          return Promise.reject(error);
        }
        
        // Retry logic for timeout errors
        if (error.code === 'ECONNABORTED' && config?.url && (!config._retryCount || config._retryCount < 3)) {
          config._retryCount = (config._retryCount || 0) + 1;
          console.log(`Retrying request to ${config.url} (attempt ${config._retryCount})`);
          return instance(config);
        }
        
        // Log detailed error information
        console.error('Response error:', {
          url: config?.url,
          method: config?.method,
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        });
        
        return Promise.reject(error);
      }
    );

    return instance;
  }, [toast]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log('Starting dashboard data fetch...');
        let projects: Project[] = [];
        let appointments: Appointment[] = [];
        let hasError = false;

        // Fetch projects
        try {
          console.log('Fetching projects...');
          const projectsResponse = await apiInstance.get<Project[]>("/api/projects/all");
          if (projectsResponse.data) {
            console.log('Projects fetched successfully:', projectsResponse.data.length, 'projects');
            projects = projectsResponse.data;
          } else {
            console.warn('Projects response was empty');
            hasError = true;
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
          hasError = true;
          toast({
            title: "Warning",
            description: "Failed to load projects. Some data may be missing.",
            variant: "destructive"
          });
        }

        // Fetch appointments
        try {
          console.log('Fetching appointments...');
          const appointmentsResponse = await apiInstance.get<Appointment[]>("/api/appointments/all");
          if (appointmentsResponse.data) {
            console.log('Appointments fetched successfully:', appointmentsResponse.data.length, 'appointments');
            appointments = appointmentsResponse.data;
          } else {
            console.warn('Appointments response was empty');
            hasError = true;
          }
        } catch (error: any) {
          console.error('Error fetching appointments:', error);
          hasError = true;
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to load appointments. Please try again.",
            variant: "destructive"
          });
        }

        // Calculate statistics even if we have partial data
        const totalProjects = projects.length;
        const pendingProjectsCount = projects.filter(p => p.status === 'pending').length;
        const totalAppointments = appointments.length;
        const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

        setStats([
          {
            title: "Total Projects",
            value: totalProjects,
            description: "Projects to review",
            icon: <FileText className="h-5 w-5 text-primary" />
          },
          {
            title: "Pending Projects",
            value: pendingProjectsCount,
            description: "Awaiting your feedback",
            icon: <Clock className="h-5 w-5 text-yellow-500" />
          },
          {
            title: "Total Appointments",
            value: totalAppointments,
            description: "All scheduled appointments",
            icon: <Calendar className="h-5 w-5 text-blue-500" />
          },
          {
            title: "Pending Appointments",
            value: pendingAppointmentsCount,
            description: "Appointments awaiting approval",
            icon: <Clock className="h-5 w-5 text-yellow-500" />
          }
        ]);

        setPendingProjects(projects.filter(p => p.status === 'pending'));
        setPendingAppointments(appointments.filter(a => a.status === 'pending'));

        if (hasError) {
          toast({
            title: "Partial Data Loaded",
            description: "Some data could not be loaded. Please refresh to try again.",
            variant: "destructive"
          });
        } else {
          console.log('All dashboard data loaded successfully');
        }

      } catch (error) {
        console.error('Critical error in fetchDashboardData:', error);
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
  }, [toast]);

  const handleAppointmentAction = async (appointmentId: string, action: 'approved' | 'rejected') => {
    try {
      await apiInstance.patch(`/api/appointments/${appointmentId}/status`, { status: action });
      
      // Update local state to remove the approved/rejected appointment
      setPendingAppointments(prev => prev.filter(app => app._id !== appointmentId));
      
      toast({
        title: `Appointment ${action}`,
        description: `Successfully ${action} the appointment request`,
      });
    } catch (error) {
      console.error(`Error ${action} appointment:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} appointment. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (timeString: string): string => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <MainLayout allowedRole="teacher">
        <div className="container py-12">
          <div className="w-full flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout allowedRole="teacher">
      <div className="container py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {/* Pending Projects Section */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Projects</CardTitle>
              <CardDescription>Projects awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending projects</p>
              ) : (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div
                      key={project._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{project.projectTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.groupName} - {project.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {formatDate(project.createdAt)}
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/teacher/review/${project._id}`)}
                        variant="outline"
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Appointments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Appointments</CardTitle>
              <CardDescription>Appointments awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending appointments</p>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="flex flex-col space-y-3 p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">
                            Group {appointment.groupNumber}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(appointment.date)} at {formatTime(appointment.time)}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Note: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAppointmentAction(appointment._id, 'approved')}
                          variant="outline"
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleAppointmentAction(appointment._id, 'rejected')}
                          variant="outline"
                          className="flex-1"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;
