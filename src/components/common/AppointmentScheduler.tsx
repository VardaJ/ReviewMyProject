import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import axios from "axios";
import { useLocation } from "react-router-dom";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface AppointmentSchedulerProps {
  onScheduled?: () => void;
  mode?: 'student' | 'teacher';
}

const AppointmentScheduler = ({ 
  onScheduled,
  mode = 'student'
}: AppointmentSchedulerProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [groupNumber, setGroupNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const projectId = location.state?.projectId;

  // Fixed time slots
  const timeSlots: TimeSlot[] = [
    { id: "09:00", time: "09:00 AM", available: true },
    { id: "10:00", time: "10:00 AM", available: true },
    { id: "11:00", time: "11:00 AM", available: true },
    { id: "13:00", time: "01:00 PM", available: true },
    { id: "14:00", time: "02:00 PM", available: true },
    { id: "15:00", time: "03:00 PM", available: true },
    { id: "16:00", time: "04:00 PM", available: true },
  ];

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setSelectedTimeSlot(null);
  };

  const handleTimeSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const handleSchedule = async () => {
    try {
      if (!date || !selectedTimeSlot || !groupNumber) {
        toast({
          title: "Error",
          description: "Please select a date, time, and enter your group number",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('User not found');
      }

      const userData = JSON.parse(userString);
      
      const appointmentData = {
        [mode === 'student' ? 'studentId' : 'teacherId']: userData.id,
        projectId,
        date: date.toISOString().split('T')[0],
        time: selectedTimeSlot,
        groupNumber,
      };

      console.log('Sending appointment data:', appointmentData);

      // Log the full request URL
      console.log('Making request to:', '/api/appointments/create');
      
      const response = await axios.post('/api/appointments/create', appointmentData);

      console.log('Appointment creation response:', response.data);

      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });
      
      // Reset form
      setDate(undefined);
      setSelectedTimeSlot(null);
      setGroupNumber("");
      
      // Callback if provided
      if (onScheduled) {
        onScheduled();
      }
    } catch (error: any) {
      console.error('Error scheduling appointment:', error);
      console.error('Full error object:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Discussion Time</CardTitle>
        <CardDescription>
          Select a date and time for your discussion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {mode === 'student' && (
          <div>
            <h4 className="text-sm font-medium mb-3">Group Number</h4>
            <input
              type="text"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              placeholder="Enter your group number"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-3">Select Date</h4>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
            className="rounded-md border"
          />
        </div>

        {date && (
          <div>
            <h4 className="text-sm font-medium mb-3">Select Time</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                  className={`w-full ${!slot.available && "opacity-50 cursor-not-allowed"}`}
                  onClick={() => handleTimeSelect(slot.id)}
                  disabled={!slot.available || isLoading}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSchedule}
          disabled={!date || !selectedTimeSlot || (mode === 'student' && !groupNumber) || isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            "Schedule Discussion"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppointmentScheduler;
