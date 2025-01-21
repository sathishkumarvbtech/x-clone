import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)

        console.log("MongoDB connected");
    } catch (error) {
        console.log(`Error in connecting DB: ${error}`);
        process.exit(1);
    }
}

export default connectDB