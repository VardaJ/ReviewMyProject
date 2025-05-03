import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Download, Eye } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface Project {
    _id: string;
    groupName: string;
    projectTitle: string;
    description: string;
    fileUrls: string[];
    uploadedBy: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const TeacherProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await axios.get('/api/projects/all');
                setProjects(response.data);
            } catch (error: any) {
                console.error('Error loading projects:', error);
                toast({
                    title: "Error loading projects",
                    description: error.message || "Failed to load projects",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, []);

    const updateProjectStatus = async (projectId: string, newStatus: 'approved' | 'rejected') => {
        try {
            await axios.patch(`/api/projects/${projectId}/status`, { status: newStatus });
            setProjects(projects.map(project => 
                project._id === projectId 
                    ? { ...project, status: newStatus }
                    : project
            ));
            toast({
                title: "Status updated",
                description: `Project ${newStatus} successfully`,
            });
        } catch (error: any) {
            console.error('Error updating project status:', error);
            toast({
                title: "Error updating status",
                description: error.message || "Failed to update project status",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-4 h-4 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <MainLayout allowedRole="teacher">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout allowedRole="teacher">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Student Projects</h1>
                <div className="grid gap-6">
                    {projects.map((project) => (
                        <Card key={project._id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>{project.projectTitle}</CardTitle>
                                {getStatusBadge(project.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-1">Group Name</h3>
                                        <p className="text-sm text-gray-600">{project.groupName}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Description</h3>
                                        <p className="text-sm text-gray-600">{project.description}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Files</h3>
                                        <div className="flex gap-2">
                                            {project.fileUrls.map((url, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(url, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View File {index + 1}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    {project.status === 'pending' && (
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                onClick={() => updateProjectStatus(project._id, 'approved')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => updateProjectStatus(project._id, 'rejected')}
                                                variant="destructive"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherProjects; 