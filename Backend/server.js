const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const server = require('./src/app.js');
const connectDB = require('./src/db/db.js');

(async () => {
    try {
        await connectDB();
        server.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();