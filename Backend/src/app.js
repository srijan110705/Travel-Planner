const express=require('express');
const cookieParser=require("cookie-parser");
const http = require('http');
const { Server } = require('socket.io');
const authRoutes=require("./routes/auth.routes");
const tripRoutes=require('./routes/trip.routes');
const aiRoutes=require('./routes/ai.routes');
const cors = require('cors');

const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // The exact URL of your Vite React app
    credentials: true                // Required to allow cookies to pass through
}));

// 1. Create Server and Sockets
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', credentials: true }
});

// 2. The Magic Line: Make 'io' available inside your Express controllers
app.set('io', io);

// 3. Simple Room Management
io.on('connection', (socket) => {
    socket.on('join_trip', (trip_id) => {
        socket.join(trip_id); // Puts the user in a room specific to this trip
    });
});

app.use('/api/auth',authRoutes);
app.use('/api/trip',tripRoutes);
app.use('/api/ai',aiRoutes);

module.exports=server;
