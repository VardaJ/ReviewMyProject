import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadProject } from "@/api/projectApi";

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    groupNumber: "",
    groupName: "",
    projectTitle: "",
    description: "",
    files: [] as File[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Validate file sizes before setting
      const files = Array.from(e.target.files);
      const maxSize = 20 * 1024 * 1024; // 20MB
      const invalidFiles = files.filter(file => file.size > maxSize);
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Error",
          description: "Some files are too large. Maximum size is 20MB per file.",
          variant: "destructive"
        });
        e.target.value = ''; // Reset file input
        return;
      }

      if (files.length > 5) {
        toast({
          title: "Error",
          description: "Maximum 5 files allowed.",
          variant: "destructive"
        });
        e.target.value = ''; // Reset file input
        return;
      }

      setFormData(prev => ({
        ...prev,
        files: files
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting form submission...');
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const userString = localStorage.getItem('user');
      console.log('User data from localStorage:', userString);
      
      if (!userString) {
        throw new Error('User not found. Please log in again.');
      }

      const userData = JSON.parse(userString);
      console.log('Parsed user data:', userData);

      // Validate form data
      if (!formData.groupNumber || !formData.groupName || !formData.projectTitle || !formData.description || formData.files.length === 0) {
        throw new Error('Please fill in all required fields and upload at least one file');
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('groupNumber', formData.groupNumber.trim());
      formDataToSend.append('groupName', formData.groupName.trim());
      formDataToSend.append('projectTitle', formData.projectTitle.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('uploadedBy', userData.id);

      // Log files being uploaded
      console.log('Files to upload:', formData.files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      })));

      // Append each file
      formData.files.forEach((file) => {
        formDataToSend.append('files', file);
      });

      console.log('Starting upload with FormData...');
      const response = await uploadProject(formDataToSend, (progress) => {
        console.log('Upload progress update:', progress);
        setUploadProgress(progress);
      });
      console.log('Upload completed:', response);

      toast({
        title: "Success",
        description: "Project submitted successfully!",
      });

      // Reset form and navigate
      setFormData({
        groupNumber: "",
        groupName: "",
        projectTitle: "",
        description: "",
        files: []
      });
      navigate('/student/projects');
    } catch (error: any) {
      console.error('Form submission error:', {
        error,
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = "Failed to submit project. ";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Upload timed out. Please try again with smaller files or check your connection.";
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Cannot connect to backend server. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details) {
        errorMessage = Object.values(error.response.data.details)
          .filter(Boolean)
          .join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log('Form submission completed');
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit New Project</CardTitle>
          <CardDescription>
            Fill in the project details and upload your files
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="groupNumber" className="text-sm font-medium">
                  Group Number *
                </label>
                <Input
                  id="groupNumber"
                  name="groupNumber"
                  value={formData.groupNumber}
                  onChange={handleInputChange}
                  placeholder="Enter group number"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="groupName" className="text-sm font-medium">
                  Group Name *
                </label>
                <Input
                  id="groupName"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="projectTitle" className="text-sm font-medium">
                Project Title *
              </label>
              <Input
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                placeholder="Enter project title"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Project Description *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description"
                required
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="files" className="text-sm font-medium">
                Project Files * (Max 5 files, 20MB each)
              </label>
              <Input
                id="files"
                name="files"
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                required
                className="cursor-pointer"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Allowed file types: PDF, DOCX, images (JPG, PNG), ZIP
              </p>
              {formData.files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <ul className="text-sm text-muted-foreground">
                    {formData.files.map((file, index) => (
                      <li key={index}>
                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {isLoading && uploadProgress > 0 && (
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/student/projects')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  {uploadProgress > 0 ? `Uploading (${uploadProgress}%)` : 'Processing...'}
                </>
              ) : (
                "Submit Project"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewProject;
