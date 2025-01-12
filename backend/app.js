const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv");

// express setup
const app = express();

// Import routes
const userRouter = require('./routes/users');
const messageRouter = require('./routes/messages');

app.use(cors())
app.use(express.json());
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI);

mongoose.connection.on('connected', () => console.log('Database connected!'));
mongoose.connection.on('disconnected', () => console.log('Database disconnected!'));
mongoose.connection.on('error', (err) => console.log(`Database error ${err}`));


// Handlinng/Directing routes
app.use('/users', userRouter);
app.use('/message/', messageRouter);


// root route endpoint
app.get('/', (req, res) => {
    res.send("Root endpoint!");
});


// Default catch all error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// start the server
application.listen(process.env.PORT, () => {
    console.log(`ChatPlus app listening on port ${process.env.PORT}`);
})