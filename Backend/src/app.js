const express=require('express');
const cookieParser=require("cookie-parser");
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

app.use('/api/auth',authRoutes);
app.use('/api/trip',tripRoutes);
app.use('/api/ai',aiRoutes);

module.exports=app;
