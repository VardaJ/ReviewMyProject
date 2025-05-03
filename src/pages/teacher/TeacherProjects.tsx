import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Project {
    _id: string;
    groupNumber: string;
    groupName: string;
    projectTitle: string;
    fileUrl: string;
    uploadedBy: {
        name: string;
    };
    createdAt: string;
}

const TeacherProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProjects = async () => {
            try {
                console.log('Fetching projects...');
                const response = await axios.get('/api/projects/all');
                console.log('API Response:', response);

                if (response.status !== 200) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const data = response.data;
                console.log('Received data:', data);

                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    console.error('Received non-array data:', data);
                    setError('Invalid data format received from server');
                    setProjects([]);
                }
            } catch (err: any) {
                console.error('Error loading projects:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load projects';
                setError(errorMessage);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <MainLayout allowedRole="teacher">
                <div className="container py-12">
                    <div className="w-full flex justify-center items-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout allowedRole="teacher">
                <div className="container py-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Projects</h2>
                            <p className="text-muted-foreground">{error}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Please make sure the backend server is running and try again.
                            </p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout allowedRole="teacher">
            <div className="container py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Student Projects</h1>
                        <p className="text-muted-foreground">
                            Review and manage student project submissions
                        </p>
                    </div>
                    <Button onClick={() => navigate('/teacher/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            {projects.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No projects found</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Group Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Group Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Project Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Uploaded By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Upload Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {projects.map((project) => (
                                            <tr key={project._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {project.groupNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {project.groupName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {project.projectTitle}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {project.uploadedBy.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(project.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/teacher/projects/${project._id}`)}
                                                        >
                                                            Review
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(project.fileUrl, '_blank')}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default TeacherProjects;
