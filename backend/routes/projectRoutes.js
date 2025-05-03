import express from 'express';
import Project from '../models/Project.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure directory exists before saving
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        try {
            // Sanitize filename
            const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + originalName);
        } catch (error) {
            cb(new Error('Error processing file name: ' + error.message));
        }
    }
});

// File filter to check file types
const fileFilter = (req, file, cb) => {
    try {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'application/zip',
            'application/x-zip-compressed'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.originalname}. Only PDF, DOCX, images, or ZIP files are allowed.`), false);
        }
    } catch (error) {
        cb(new Error('Error checking file type: ' + error.message));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: fileFilter
}).array('files', 5);

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Endpoint to upload project
router.post('/upload', (req, res) => {
    console.log('Received upload request');
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        message: 'File too large. Maximum size is 20MB.'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        message: 'Too many files. Maximum is 5 files.'
                    });
                }
                return res.status(400).json({
                    message: 'File upload error: ' + err.message
                });
            }
            return res.status(500).json({
                message: 'Error uploading files: ' + err.message
            });
        }

        try {
            console.log('Processing upload request:', {
                body: req.body,
                files: req.files?.map(f => ({ name: f.originalname, size: f.size }))
            });

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "No files uploaded" });
            }

            const { groupNumber, groupName, projectTitle, description, uploadedBy, teacherId } = req.body;
            
            // Validate required fields
            if (!groupNumber || !groupName || !projectTitle || !description || !uploadedBy) {
                return res.status(400).json({ 
                    message: "Missing required fields", 
                    details: {
                        groupNumber: !groupNumber ? "Group number is required" : null,
                        groupName: !groupName ? "Group name is required" : null,
                        projectTitle: !projectTitle ? "Project title is required" : null,
                        description: !description ? "Description is required" : null,
                        uploadedBy: !uploadedBy ? "User ID is required" : null
                    }
                });
            }
            
            // Get the file URLs from the uploaded files
            const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
            
            const project = new Project({
                groupNumber,
                groupName,
                projectTitle,
                description,
                fileUrls,
                uploadedBy,
                teacherId: teacherId || null,
                status: 'pending'
            });
            
            await project.save();

            console.log('Project saved successfully:', {
                id: project._id,
                title: project.projectTitle,
                files: project.fileUrls
            });

            res.status(201).json({ 
                message: "Project uploaded successfully", 
                project 
            });
        } catch (error) {
            console.error('Error saving project:', error);
            
            // Clean up uploaded files if project save fails
            if (req.files) {
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkError) {
                        console.error('Error deleting file:', unlinkError);
                    }
                });
            }
            
            // Handle mongoose validation errors
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: "Validation error",
                    details: Object.keys(error.errors).reduce((acc, key) => {
                        acc[key] = error.errors[key].message;
                        return acc;
                    }, {})
                });
            }
            
            // Handle other errors
            res.status(500).json({ 
                message: "Error uploading project",
                error: error.message
            });
        }
    });
});

// Endpoint to fetch all projects (for teacher)
router.get("/all", async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
});

// Endpoint to fetch user's projects (for student)
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Log the request details
        console.log('Fetching projects for user:', userId);
        
        // Validate userId
        if (!userId) {
            return res.status(400).json({ 
                message: "User ID is required",
                details: "Please provide a valid user ID"
            });
        }

        // Fetch projects
        const projects = await Project.find({ uploadedBy: userId })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        console.log(`Found ${projects.length} projects for user ${userId}`);
        
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ 
            message: "Error fetching user projects", 
            error: error.message,
            details: "There was an error retrieving your projects. Please try again."
        });
    }
});

// Endpoint to get a single project by ID
router.get("/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: "Error fetching project", error: error.message });
    }
});

// Endpoint to update project status
router.patch("/:projectId/status", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status value",
                details: "Status must be one of: pending, approved, rejected"
            });
        }

        const project = await Project.findByIdAndUpdate(
            projectId,
            { status },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ 
            message: "Error updating project status", 
            error: error.message 
        });
    }
});

// Export the router
export default router;
