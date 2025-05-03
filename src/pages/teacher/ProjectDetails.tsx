

import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProjectReview from "@/components/teacher/ProjectReview";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <MainLayout allowedRole="teacher">
        <div className="container py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Project not found</h1>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout allowedRole="teacher">
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Project Review</h1>
        <ProjectReview projectId={id} />
      </div>
    </MainLayout>
  );
};

export default ProjectDetails;
