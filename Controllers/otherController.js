import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { statModel } from "../Models/Stats.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { sendEmail } from "../Utils/sendEmail.js";

export const contactHandler=catchAsyncError(async(req,res,next)=>{

    const {name,email,message} = req.body

    if(!name || !email || !message){
        return next(new ErrorHandler('All fields are mandatory',400))
    }

    const to = process.env.MY_MAIL

    const subject = 'Contact from CourseBundler'

    const text = `I am ${name} from & my Email is ${email}. \n ${message}`

    await sendEmail(to,subject,text)

    res.status(200).json({
        success:true,
        message:"Your message has been sent.."
    })
})


export const courseRequest=catchAsyncError(async(req,res,next)=>{

    const {name,email,course} = req.body

    if(!name || !email || !course){
        return next(new ErrorHandler('All fields are mandatory',400))
    }


    const to = process.env.MY_MAIL

    const subject = 'Contact from CourseBundler'

    const text = `I am ${name} from & my Email is ${email}. \n ${course}`

    await sendEmail(to,subject,text)

    res.status(200).json({
        success:true,
        message:"Your request has been sent.."
    })
})


export const adminDashboard=catchAsyncError(async(req,res,next)=>{

    const stat = await statModel.find({}).sort({createdAt:'desc'}).limit(12)

    // add all needed calculation here and send it to the response

    res.status(200).json({
        success:true,
        message:"Your message has been sent.."
    })
})