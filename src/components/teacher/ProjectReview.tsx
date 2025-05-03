import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Calendar, Download, FileText, User } from "lucide-react";
import axios from "axios";

interface ProjectReviewProps {
  projectId: string;
}

interface Project {
  _id: string;
  groupNumber: string;
  groupName: string;
  projectTitle: string;
  description: string;
  fileUrls: string[];
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const ProjectReview = ({ projectId }: ProjectReviewProps) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error: any) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load project details",
          variant: "destructive",
        });
      }
    };

    fetchProject();
  }, [projectId, toast]);

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

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.patch(`/api/projects/${projectId}/status`, {
        status: 'approved'
      });
      toast({
        title: "Project approved",
        description: "Feedback has been sent to the student",
      });
      navigate("/teacher/projects");
    } catch (error: any) {
      console.error('Error approving project:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await axios.patch(`/api/projects/${projectId}/status`, {
        status: 'rejected'
      });
      toast({
        title: "Project needs revision",
        description: "Feedback has been sent to the student",
      });
      navigate("/teacher/projects");
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = () => {
    navigate(`/teacher/appointments`, { state: { projectId } });
  };

  if (!project) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.projectTitle}</CardTitle>
              <CardDescription className="mt-1">
                Group {project.groupNumber} • Submitted {formatDate(project.createdAt)}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${
                project.status === 'approved' 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : project.status === 'rejected'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${
                project.status === 'approved' 
                  ? 'bg-green-500' 
                  : project.status === 'rejected'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}></span>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
            <User className="w-5 h-5 mt-1 text-primary" />
            <div>
              <h4 className="text-sm font-medium">Group Information</h4>
              <p className="text-sm mt-1">Group {project.groupNumber}</p>
              <p className="text-sm text-muted-foreground">{project.groupName}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Project Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{project.description}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Attached Files</h4>
            <div className="space-y-2">
              {project.fileUrls.map((fileUrl, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-secondary/40 rounded-md hover:bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm">File {index + 1}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Feedback to Student</h4>
            <Textarea
              placeholder="Provide feedback or comments about the project..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none min-h-[120px]"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t bg-secondary/20 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/teacher/projects")}>
              Back to Projects
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleSchedule}
            >
              <Calendar className="h-4 w-4" />
              Schedule Discussion
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              className="flex items-center gap-1"
              onClick={handleReject}
              disabled={loading || !feedback || project.status !== 'pending'}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Needs Revision
                </>
              )}
            </Button>
            <Button 
              variant="default" 
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={loading || project.status !== 'pending'}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProjectReview;
