import { razorInstance } from "../index.js";

import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { userModel } from "../Models/User.js";
import {createHmac} from 'crypto'
import { paymentModel } from "../Models/Payment.js";

export const buySubscription = catchAsyncError(async(req,res,next)=>{

    const user = await userModel.findByid(req.user._id)

    const subscription = await razorInstance.subscriptions.create({
        plan_id: process.env.PLAN_ID,
        customer_notify: 1,
        total_count: 12
    })

    user.subscription.id = subscription.id
    user.subscription.status = subscription.status

    await user.save()

    res.status(201).json({
        success:true,
        subscription_id:subscription.id,
    })
})


export const paymentVerification = catchAsyncError(async(req,res,next)=>{

    const {rezorPay_signature,razorpay_payment_id,razorpay_subscription_id} = req.body

    const user = await userModel.findByid(req.user._id)

    const subscription_id = user.subscription.id

    const generated_signature = createHmac('sha512',process.env.RAZORPAY_API_SECRET).update(razorpay_payment_id+'|'+subscription_id,'utf-8').digest('hex')

    const isAuthentic = generated_signature===rezorPay_signature

    if(!isAuthentic)
    return res.redirect(`${process.env.FRONT_END_URL}/paymentfailed`)

    await paymentModel.create({
        rezorPay_signature,razorpay_payment_id,razorpay_subscription_id
    })

    user.subscription.status='active'

    await user.save()

    res.redirect(`${process.env.FRONT_END_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
})

export const getRazorPayKey=catchAsyncError(async(req,res,next)=>{
    res.status(200).json({
        success:true,
        key:process.env.RAZORPAY_API_KEY
    })
})

export const cancelSubscription=catchAsyncError(async(req,res,next)=>{
    const user = await userModel.findByid(req.user._id)

    const subscription_id = user.subscription.id

    let refund = false

    await razorInstance.subscriptions.cancel(subscription_id)

    const payment = await paymentModel.findOne({
        razorpay_subscription_id:subscription_id
    })

    const gap = Date.now() - payment.createdAt

    const refundTime = process.env.REFUND_DAYS*24*60*60*1000

    if(refundTime>gap){
        await razorInstance.payments.refund(payment.razorpay_payment_id)
        refund=true
    }

    await payment.remove()
    user.subscription.id=undefined
    user.subscription.status=undefined
    await user.save()


    res.status(200).json({
        success:true,
        message:refund?"Subscription cancelled, you will recive full fund within 7 days":"Subscription cancelled, now refund initiated as subscription was cancelled after 7 days"
    })
})