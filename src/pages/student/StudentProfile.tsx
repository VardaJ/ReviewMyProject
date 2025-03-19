import MainLayout from "@/components/layout/MainLayout";
import ProfileForm from "@/components/student/ProfileForm";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const StudentProfile = () => {
  const [profileStats, setProfileStats] = useState({
    projectsCompleted: 0,
    coursesEnrolled: 0,
    averageGrade: null
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    // In a real app, this would be an API call to fetch user profile data
    // For now, we'll keep initial values as 0 or null
  }, []);

  return (
    <MainLayout allowedRole="student">
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Profile</h1>
        <div className={isMobile ? "space-y-6" : "grid grid-cols-3 gap-6"}>
          <div className="col-span-2">
            <ProfileForm initialStats={profileStats} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentProfile;
