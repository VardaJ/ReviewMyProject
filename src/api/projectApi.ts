import axios from 'axios';

// Use relative URL since we're using Vite's proxy
const API_URL = '/api/projects';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds for file uploads
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        // For file uploads, let the browser set the Content-Type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        console.log('Making request to:', config.url, {
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
            throw new Error('Network error. Please check your connection and try again.');
        }
        throw error;
    }
);

export const uploadProject = async (formData: FormData, onProgress?: (progress: number) => void) => {
    console.log('Starting project upload...');
    try {
        console.log('FormData contents:', Array.from(formData.entries()).map(([key, value]) => {
            if (value instanceof File) {
                return `${key}: File(${value.name}, ${value.size} bytes)`;
            }
            return `${key}: ${value}`;
        }));

        const response = await api.post('/upload', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                console.log('Upload progress:', {
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                    progress: progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0
                });
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
        console.log('Upload completed successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        if (error.response?.status === 404) {
            throw new Error('Upload endpoint not found. Please check server configuration.');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to upload project');
    }
};

// 📌 Fetch All Projects (for Teacher)
export const fetchAllProjects = async () => {
    try {
        const response = await api.get('/all');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch projects');
    }
};
