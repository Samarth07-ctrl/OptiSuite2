// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRouter = require('./routes/api');
const db = require('./config/db'); 
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow all origins for dev to prevent port issues
app.use(express.json()); // Parses incoming JSON requests

// Use the main API router
app.use('/api', apiRouter); 
// DO NOT add the sales router again here, apiRouter already handles it.

// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('Welcome to the OptiManager Backend API!');
});

// Global Error Logger - This will print errors to your terminal
app.use((err, req, res, next) => {
    console.error('--- UNHANDLED ERROR ---');
    console.error(err.stack); // This will print the full error details
    console.error('-----------------------');
    res.status(500).json({ message: 'An unhandled server error occurred.' });
});

// Check database connection and start the server
db.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database.');
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err);
        console.log('Server not started due to database connection error.');
    });