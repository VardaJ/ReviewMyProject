import MainLayout from "@/components/layout/MainLayout";
import AppointmentScheduler from "@/components/common/AppointmentScheduler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
  createdAt: string;
}

const StudentAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User not found');
        }

        const userData = JSON.parse(userString);
        const response = await axios.get(`/api/appointments/student/${userData.id}`);
        setAppointments(response.data);
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error fetching appointments",
          description: error.message || "Failed to load appointments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [showScheduler]); // Refetch when scheduler is closed

  const handleScheduled = () => {
    setShowScheduler(false);
    // Appointments will be refetched due to the useEffect dependency
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <MainLayout allowedRole="student">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
            <p className="text-muted-foreground">
              View and manage your scheduled discussions with teachers
            </p>
          </div>
          <Button
            onClick={() => setShowScheduler(!showScheduler)}
            variant={showScheduler ? "outline" : "default"}
          >
            {showScheduler ? "Cancel" : "Schedule Time"}
          </Button>
        </div>

        {showScheduler && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <AppointmentScheduler onScheduled={handleScheduled} mode="student" />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No appointments yet</p>
                <p className="text-gray-500 mb-4">Schedule your first appointment</p>
                <Button onClick={() => setShowScheduler(true)}>
                  Schedule Time
                </Button>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Discussion Time</CardTitle>
                      <CardDescription>
                        Scheduled for {formatDate(appointment.date)} at {appointment.time}
                      </CardDescription>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointment.notes && (
                      <div>
                        <h3 className="font-semibold mb-1">Notes</h3>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Requested on {new Date(appointment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentAppointments;
