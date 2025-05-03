import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Upload } from "lucide-react";


interface ProfileStats {
  projectsCompleted: number;
  coursesEnrolled: number;
  averageGrade: number | null;
}

interface ProfileFormProps {
  initialStats?: ProfileStats;
}

interface StudentProfile {
  name: string;
  email: string;
  department: string;
  year: string;
  bio: string;
  avatarUrl: string;
  groupMembers: string[]; // New property for group member names
  groupNumber: string; // New property for group number
}

const ProfileForm = ({ initialStats }: ProfileFormProps) => {
  const [profile, setProfile] = useState<StudentProfile>({
    name: "",
    email: "",
    department: "",
    year: "",
    bio: "",
    avatarUrl: "",
    groupMembers: Array(5).fill(""), // Initialize with empty strings for 5 group members
    groupNumber: "" // Initialize group number
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch profile
    setTimeout(() => {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setProfile({
          name: user.name || "",
          email: user.email || "",
          department: user.department || "",
          year: user.year || "",
          bio: user.bio || "",
          avatarUrl: user.avatarUrl || "",
          groupMembers: user.groupMembers || Array(5).fill(""), // Reset group members
          groupNumber: user.groupNumber || "" // Reset group number
        });
      }
      setIsLoadingProfile(false);
    }, 1000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("groupMember")) {
      const index = parseInt(name.split("groupMember")[1]) - 1; // Extract index from name
      const newGroupMembers = [...profile.groupMembers];
      newGroupMembers[index] = value;
      setProfile(prev => ({ ...prev, groupMembers: newGroupMembers }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfile(prev => ({ ...prev, avatarUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Submitting profile:", profile); // Debug log

    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Update user info in localStorage
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        localStorage.setItem("user", JSON.stringify({
          ...user,
          name: profile.name,
          email: profile.email,
          groupMembers: profile.groupMembers,
          groupNumber: profile.groupNumber
        }));
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    }, 1500); // Simulate delay for API call
    console.log("Profile saved to localStorage:", profile); // Debug log
  };

  if (isLoadingProfile) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and profile settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              ) : (
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex items-center">
              <Label
                htmlFor="avatar"
                className="cursor-pointer text-sm text-primary flex items-center gap-1 hover:underline"
              >
                <Upload className="h-4 w-4" />
                Change Profile Picture
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={profile.department}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year of Study</Label>
              <Input
                id="year"
                name="year"
                value={profile.year}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* New Group Member Fields */}
          <div className="space-y-2">
            <Label>Group Members</Label>
            {profile.groupMembers.map((member, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`groupMember${index + 1}`}>Group Member {index + 1} Name</Label>
                <Input
                  id={`groupMember${index + 1}`}
                  name={`groupMember${index + 1}`}
                  value={member}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>

          {/* New Group Number Field */}
          <div className="space-y-2">
            <Label htmlFor="groupNumber">Group Number</Label>
            <Input
              id="groupNumber"
              name="groupNumber"
              value={profile.groupNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself..."
              rows={4}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end border-t bg-secondary/20 pt-4">
        <Button type="submit" form="profile-form" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2">Saving</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;
