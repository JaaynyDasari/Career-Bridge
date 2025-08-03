const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("\n\n--- FATAL ERROR: Cloudinary credentials not found ---");
    console.error("Please ensure your .env file is in the ROOT 'project' folder and contains the required Cloudinary keys.\n\n");
    process.exit(1);
} else {
    console.log("SUCCESS: Cloudinary environment variables loaded correctly.");
}