import express from 'express';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new appointment
router.post("/create", async (req, res) => {
    try {
        const { studentId, teacherId, projectId, date, time, notes, groupNumber } = req.body;
        console.log('Creating appointment with data:', { studentId, teacherId, projectId, date, time, notes, groupNumber });
        
        // Validate required fields
        if ((!studentId && !teacherId) || !date || !time || !groupNumber) {
            console.log('Validation failed:', { studentId, teacherId, date, time, groupNumber });
            return res.status(400).json({ 
                message: "Missing required fields",
                details: {
                    user: (!studentId && !teacherId) ? "Either student ID or teacher ID is required" : null,
                    date: !date ? "Date is required" : null,
                    time: !time ? "Time is required" : null,
                    groupNumber: !groupNumber ? "Group number is required" : null
                }
            });
        }

        const appointment = new Appointment({
            studentId: studentId || null,
            teacherId: teacherId || null,
            projectId: projectId || null,
            groupNumber,
            date,
            time,
            notes: notes || '',
            status: 'pending'
        });

        console.log('Saving appointment:', appointment);
        await appointment.save();
        console.log('Appointment saved successfully:', appointment);
        
        res.status(201).json({
            message: "Appointment scheduled successfully",
            appointment
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            message: "Error scheduling appointment",
            error: error.message
        });
    }
});

// Get appointments for a student
router.get("/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        
        console.log('=== Appointment Fetch Request ===');
        console.log('Student ID:', studentId);
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        console.log('Request headers:', req.headers);
        
        // Check if the database is connected
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB is not connected. Current state:', mongoose.connection.readyState);
            return res.status(500).json({
                message: "Database connection error",
                error: "MongoDB is not connected"
            });
        }

        // Try to find appointments
        console.log('Attempting to find appointments...');
        const appointments = await Appointment.find({ studentId })
            .select('_id studentId teacherId projectId date time status notes groupNumber')
            .populate('teacherId', 'name')
            .populate('projectId', 'title')
            .sort({ date: 1, time: 1 })
            .lean();
            
        console.log(`✅ Found ${appointments.length} appointments for student ${studentId}`);
        console.log('Appointments:', JSON.stringify(appointments, null, 2));
        
        res.status(200).json(appointments);
    } catch (error) {
        console.error('❌ Error fetching student appointments:', {
            error: error.message,
            stack: error.stack,
            studentId: req.params.studentId,
            mongooseState: mongoose.connection.readyState,
            errorName: error.name,
            errorCode: error.code
        });

        // Check for specific error types
        if (error.name === 'MongoError') {
            console.error('MongoDB specific error:', {
                code: error.code,
                codeName: error.codeName,
                keyPattern: error.keyPattern,
                keyValue: error.keyValue
            });
        }

        res.status(500).json({
            message: "Error fetching appointments",
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                code: error.code,
                stack: error.stack
            } : undefined
        });
    }
});

// Get all appointments
router.get("/all", async (req, res) => {
    try {
        console.log('Fetching all appointments...');
        const appointments = await Appointment.find()
            .select('_id studentId teacherId projectId date time status notes groupNumber')
            .populate('studentId', 'name')
            .populate('projectId', 'title')
            .sort({ date: 1, time: 1 })
            .lean();
        
        // Log the appointments to verify groupNumber is included
        console.log('Appointments found:', appointments.map(apt => ({
            id: apt._id,
            groupNumber: apt.groupNumber,
            student: apt.studentId?.name,
            project: apt.projectId?.title
        })));
        
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        res.status(500).json({
            message: "Error fetching appointments",
            error: error.message
        });
    }
});

// Get appointments for a teacher
router.get("/teacher/:teacherId", async (req, res) => {
    try {
        console.log('Fetching appointments for teacher:', req.params.teacherId);
        const appointments = await Appointment.find({ status: 'pending' })
            .select('_id studentId teacherId projectId date time status notes groupNumber')
            .populate('studentId', 'name')
            .populate('projectId', 'title')
            .sort({ date: 1, time: 1 })
            .lean();
            
        console.log(`Found ${appointments.length} pending appointments:`, 
            appointments.map(apt => ({
                id: apt._id,
                groupNumber: apt.groupNumber,
                student: apt.studentId?.name,
                date: apt.date,
                time: apt.time
            }))
        );
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching teacher appointments:', error);
        res.status(500).json({
            message: "Error fetching appointments",
            error: error.message
        });
    }
});

// Update appointment status
router.patch("/:appointmentId/status", async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
                details: "Status must be one of: pending, approved, rejected, completed"
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            message: "Error updating appointment status",
            error: error.message
        });
    }
});

// Delete an appointment
router.delete("/:appointmentId", async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findByIdAndDelete(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({
            message: "Error deleting appointment",
            error: error.message
        });
    }
});

export default router; 