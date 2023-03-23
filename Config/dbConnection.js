import mongoose from "mongoose";

mongoose.set('strictQuery', false);

export const connectDB = async()=>{
    const {connection} = await mongoose.connect(process.env.MONGO_URI,(err)=>{
        if(err) 
            console.log(err);
        else{console.log('DB connected')}
    
    });
    
}