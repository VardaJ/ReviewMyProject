
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";


// Pages

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProjects from "./pages/student/StudentProjects";
import NewProject from "./pages/student/NewProject";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAppointments from "./pages/student/StudentAppointments";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherProjects from "./pages/teacher/TeacherProjects";
import ProjectDetails from "./pages/teacher/ProjectDetails";
import TeacherAppointments from "./pages/teacher/TeacherAppointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Authentication Route */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/projects" element={<StudentProjects />} />
          <Route path="/student/projects/new" element={<NewProject />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/appointments" element={<StudentAppointments />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/projects" element={<TeacherProjects />} />
          <Route path="/teacher/projects/:id" element={<ProjectDetails />} />
          <Route path="/teacher/appointments" element={<TeacherAppointments />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

