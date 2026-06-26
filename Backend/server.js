const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const server = require('./src/app.js');
const connectDB = require('./src/db/db.js');
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();
        server.listen(PORT, () => 
            console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();