const User = require("../models/user.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

const createUser = async (req, res) => {
    try {
        console.log('📝 Creating new user with data:', { ...req.body, password: '[REDACTED]' });
        
        const { firstName, lastName, email, password, phoneNumber } = req.body;
        
        // Check if user already exists
        console.log('🔍 Checking if user exists with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists with email:', email);
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user instance
        console.log('👤 Creating new user instance');
        const user = new User({ 
            firstName, 
            lastName, 
            email, 
            password, // Will be hashed by pre-save middleware
            phoneNumber 
        });

        // Save the user to the database
        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User saved successfully with ID:', user._id);

        // Generate JWT token
        console.log('🔑 Generating JWT token');
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('🎉 User creation process completed successfully');
        res.status(201).json({
            message: "User created successfully",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            token
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

const signIn = async (req, res) => {
    try {
        console.log('🔑 Sign in attempt for email:', req.body.email);
        
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found with email:', email);
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password
        console.log('🔐 Comparing passwords...');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('❌ Invalid password for user:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        console.log('🎟️ Generating JWT token');
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('✅ Sign in successful for user:', email);
        res.status(200).json({
            message: "Sign in successful",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            token
        });
    } catch (error) {
        console.error('❌ Error during sign in:', error);
        res.status(500).json({ message: "Error during sign in", error: error.message });
    }
};

const getUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json(user);
};

const updateUser = async (req, res) => {
    const { Email, Password } = req.body;
    const user = await User.findOneAndUpdate({ Email, Password }, req.body, { new: true });
    res.status(200).json(user);
};                  

const deleteUser = async (req, res) => {
    const { Email, Password } = req.body;
    const user = await User.findOneAndDelete({ Email, Password });
    res.status(200).json(user);
};

const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
};

const deleteUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json(user);
};

const updateUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(user);
};

// Get current user profile (for AuthContext)
const getMe = async (req, res) => {
    try {
        // req.user is set by the authenticateToken middleware
        const user = req.user;
        res.status(200).json({
            id: user._id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber
        });
    } catch (error) {
        console.error('❌ Error getting user profile:', error);
        res.status(500).json({ message: "Error getting user profile", error: error.message });
    }
};

module.exports = { createUser, signIn, getMe };