import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { uploadProject } from "@/api/projectApi";
import { useNavigate } from "react-router-dom";

const ProjectForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size and type
      const invalidFiles = newFiles.filter(file => {
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'application/zip'
        ];
        
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid file type. Only PDF, DOCX, images, or ZIP files are allowed.`,
            variant: "destructive",
          });
          return true;
        }
        
        if (file.size > 20 * 1024 * 1024) { // 20MB in bytes
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum file size is 20MB.`,
            variant: "destructive",
          });
          return true;
        }
        
        return false;
      });
      
      // Filter out invalid files
      const validFiles = newFiles.filter(file => !invalidFiles.includes(file));
      
      // Check total number of files
      if (files.length + validFiles.length > 5) {
        toast({
          title: "Too many files",
          description: "Maximum 5 files allowed.",
          variant: "destructive",
        });
        return;
      }
      
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      const form = event.currentTarget;
      const titleInput = form.querySelector<HTMLInputElement>('#title');
      const subjectInput = form.querySelector<HTMLInputElement>('#subject');
      const descriptionInput = form.querySelector<HTMLTextAreaElement>('#description');

      if (!titleInput || !subjectInput || !descriptionInput) {
        throw new Error('Form fields not found');
      }

      // Get and validate user data
      const userString = localStorage.getItem('user');
      console.log('User data from localStorage:', userString);

      if (!userString) {
        console.error('No user data found in localStorage');
        throw new Error('Please log in to submit a project');
      }

      let userData;
      try {
        userData = JSON.parse(userString);
        console.log('Parsed user data:', userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        throw new Error('Invalid user data. Please log in again');
      }

      if (!userData || !userData.id) {
        console.error('User ID not found in data:', userData);
        throw new Error('User ID not found. Please log in again');
      }

      // Log the user ID we're about to use
      console.log('Using user ID:', userData.id);

      formData.append('groupName', titleInput.value);
      formData.append('projectTitle', subjectInput.value);
      formData.append('description', descriptionInput.value);
      formData.append('uploadedBy', userData.id);
      
      // Append files with the correct field name
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Log the FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value}`);
      }

      await uploadProject(formData);

      toast({
        title: "Project submitted successfully",
        description: "Your project has been sent for approval",
      });
      
      // Reset form and navigate to projects list
      form.reset();
      setFiles([]);
      navigate('/student/projects');
    } catch (error: any) {
      console.error('Error submitting project:', error);
      toast({
        title: "Error submitting project",
        description: error.message || "Failed to submit project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto glass-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl">Submit a New Project</CardTitle>
        <CardDescription>
          Fill out the form below to submit your project for approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter the title of your project"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject/Course</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Enter the subject or course"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project in detail..."
              rows={5}
              required
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="files">Upload Files</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="files"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, images, or ZIP (MAX. 20MB per file, up to 5 files)
                  </p>
                </div>
                <Input
                  id="files"
                  name="files"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Attached Files:</h4>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                      <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" form="project-form" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2">Submitting</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            "Submit Project"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectForm;
