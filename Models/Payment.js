import { Schema,model } from "mongoose";


const schema = new Schema({
    rezorPay_signature:{
        type:String,
        requireed:true
    },razorpay_payment_id:{
        type:String,
        requireed:true
    },razorpay_subscription_id:{
        type:String,
        requireed:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    

})

export const paymentModel = new model('Payment',schema)