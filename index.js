import app from "./App.js";
import { config } from 'dotenv'
import { connectDB } from "./Config/dbConnection.js";
import cloudinary from 'cloudinary'
import Razorpay from "razorpay";
import NodeCorn from 'node-cron'
import { statModel } from "./Models/Stats.js";
import cors from 'cors'

config({
    path:'./Config/config.env'
})


connectDB()

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET
})

export const razorInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
})

NodeCorn.schedule('0 0 0 1 * *', async ()=>{
    try {
        await statModel.create({})
    } catch (error) {
        
    }
})

app.use(
    cors({
        origin:process.env.FRONT_END_URL,
        credentials:true,
        methods:['POST','PUT','GET','DELETE']
    })
)

app.listen(process.env.PORT,()=>{
    console.log(`Running on port ${process.env.PORT}`)
})
// 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
// https://cute-rose-bandicoot-sari.cyclic.app