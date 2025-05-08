require("dotenv").config();

const userRoutes = require('./routes/user.routes');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const helmet = require("helmet");
// import { config } from './config';
// import { dbConnection } from './database';

const app = express();
const PORT = process.env.PORT || 3200;
const MONGO = process.env.MONGO || 'mongodb://localhost:27017';

const db = mongoose.connection;
db.once("open", () => {
    console.log(`connected to ${MONGO}`);
});


mongoose.connect(`${MONGO}/DMSCUS`)
    .then(() => {
        console.log('📦 Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
    });

// Add more detailed connection logging
db.on("error", (error) => {
    console.error('❌ MongoDB connection error:', error);
});

db.on("disconnected", () => {
    console.log('⚠️ MongoDB disconnected');
});

db.on("reconnected", () => {
    console.log('🔄 MongoDB reconnected');
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`👉  App is listening on port ${PORT}`); // 3️⃣  Single, accurate log
});


