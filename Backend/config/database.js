import mongoose from "mongoose"

//  to import the .env file .....  
import dotenv from "dotenv"

dotenv.config()

export const connectDB=()=>{

    // Database connection
    mongoose.connect(process.env.MONGO_URL).then(()=>console.log("Database Connected."))

}

