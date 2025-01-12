const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv");

// express and http setup
const app = express();
const http = require('http');
const server = http.createServer(app);

// scoket.io setup
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Replace with your frontend URL in production
        methods: ['GET', 'POST'],
    },
})

// Import routes
const userRouter = require('./routes/users');
const messageRouter = require('./routes/messages');
const { handleSendMessage } = require('./controllers/messages')

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

// can we keep "conversation" model's _id room id !?
io.on('connection', (socket) => {
    console.log('A new user has connected: ', socket.id);

    socket.on('join', (username) => {
        socket.join(username); // each user joins their own room named after their username i.e., unique
        console.log('User joined room: ', username);
    })

    socket.on('send-Message', async (data) => {
        try {
            const { senderUsername, receiverUsername, message } = data;
            console.log('socket data receive: ', senderUsername + ' , ' + receiverUsername + ' , ' + message);

            const savedMessage = await handleSendMessage(senderUsername, receiverUsername, message);
            console.log('message successfully saved in DB: ', savedMessage);
            io.to(receiverUsername).emit('receive-Message', data);

        } catch (e) {
            console.log('Error in socket sendMessage: ', e.message);
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    })
})



// Default catch all error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// start the server
server.listen(process.env.PORT, () => {
    console.log(`Chat app listening on port ${process.env.PORT}`);
})
