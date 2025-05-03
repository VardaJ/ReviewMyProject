import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Project {
  _id: string;
  groupName: string;
  projectTitle: string;
  description: string;
  fileUrls: string[];
  uploadedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User not found');
        } else{
          console.log('User data from localStorage:', userString);

        }

        const userData = JSON.parse(userString);
        console.log('Parsed user data:', userData);
        const response = await axios.get(`/api/projects/user/${userData.id}`);
        setProjects(response.data);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error fetching projects",
          description: error.message || "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
        <Button onClick={() => navigate('/student/projects/new')}>
          Submit New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-600 mb-2">No projects yet</p>
            <p className="text-gray-500 mb-4">Submit your first project to get started</p>
            <Button onClick={() => navigate('/student/projects/new')}>
              Submit New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.projectTitle}</CardTitle>
                    <CardDescription>{project.groupName}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-2 capitalize">{project.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{project.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Submitted on {formatDate(project.createdAt)}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(project.fileUrls[0], '_blank')}>
                  View Files
                </Button>
                <Button 
                  onClick={() => navigate('/student/appointments', { 
                    state: { projectId: project._id } 
                  })}
                >
                  Schedule Discussion
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
