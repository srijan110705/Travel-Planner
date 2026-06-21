require('dotenv').config();
const server=require('./src/app.js');
const connectDB=require('./src/db/db.js');

connectDB();

server.listen(3000,()=>{
    console.log("Server is running on port 3000");
});