import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";
import { Calendar, Clock, FileText, User } from "lucide-react";

interface Appointment {
  id: string;
  projectTitle: string;
  projectId: string;
  student: {
    id: string;
    name: string;
  };
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
}

const TeacherAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch appointments
    setTimeout(() => {
      setAppointments([]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scheduled Appointments</h1>
            <p className="text-muted-foreground">
              Manage your upcoming and past appointments with students
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.filter(apt => apt.status === "upcoming").length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">You don't have any upcoming appointments.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="past" className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.filter(apt => apt.status === "completed").length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">You don't have any past appointments.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TeacherAppointments;
