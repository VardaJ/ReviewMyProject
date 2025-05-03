import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    groupNumber: {
        type: String,
        required: [true, 'Group number is required']
    },
    groupName: {
        type: String,
        required: [true, 'Group name is required']
    },
    projectTitle: {
        type: String,
        required: [true, 'Project title is required']
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    fileUrls: [{
        type: String,
        required: [true, 'At least one file is required']
    }],
    uploadedBy: {
        type: String,
        required: [true, 'User ID is required']
    },
    teacherId: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Project = mongoose.model("Project", projectSchema);
export default Project;  
