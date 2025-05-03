// backend/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty'], required: true },
    groupDetails: {
        groupNumber: String,
        members: [{ name: String, registrationNumber: String }],
        supervisorName: String,
    },
    projects: [{ title: String, description: String }],
});

export default mongoose.model('User', UserSchema);