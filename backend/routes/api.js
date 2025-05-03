// backend/routes/api.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
//const Project = require('../models/Project');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already in use. Please choose a different username.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword,
            role
        });

        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: 'User Created' });
    } catch (error) {
        console.error(error);  // Log the error for server debugging
        res.status(500).json({ message: 'Server Error - Please try again later.' });
    }
});


// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});

// Other routes for updating profiles, project submissions, and appointment requests would go here

module.exports = router;
