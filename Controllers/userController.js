import {userModel} from '../Models/User.js'
import {courseModel} from '../Models/Course.js'
import {catchAsyncError} from '../Middlewares/catchAsyncError.js'
import ErrorHandler from '../Utils/errorHandler.js'
import { sendToken } from '../Utils/jwtToken.js'
import { sendEmail } from '../Utils/sendEmail.js'
import {createHash,randomBytes} from 'crypto'
import cloudinary from 'cloudinary'
import { statModel } from '../Models/Stats.js'

const userRegister = catchAsyncError(async (req,res,next)=>{

    const {name,email,password} = req.body

    if(!name || !email || !password)
        return next(new ErrorHandler("Please enter all fields",400))

    let user = await userModel.findOne({email})
    
    if(user){
        return next(new ErrorHandler("User already exist",409))
    }

    const file= req.files.avatar
    
    const myCloud = await cloudinary.v2.uploader.upload(file.tempFilePath)
    
    user = await userModel.create({
        name,
        email,
        password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    })

    sendToken(user,201,'User Registered successfully',res)
})

// Login User
const loginUser=catchAsyncError(async (req,res,next)=>{
    // console.log(req.body)
    const {email,password} = req.body

    if(!email || !password){
        return next(new ErrorHandler("Please enter all fields",400))
    }

    const user = await userModel.findOne({email}).select('+password')
    // console.log(user)
    if(!user){
        return next(new ErrorHandler("Email or password not matched",400))
    }

    const isPasswordMatched = await user.comparePassword(password)

    // console.log(isPasswordMatched)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Email or password not matched",400))
    }

    sendToken(user,200,'User login successfully',res)
})


// Logout User
const logoutUser = catchAsyncError(async(req,res,next)=>{

    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"Logged out"
    })
})

// User Details 
const userDetails = catchAsyncError(async (req,res,next)=>{
    
    const user = await userModel.findById(req.user._id);

    res.status(200).json({
        success:true,
        user
    })
})


// Update user password
const updatePassword= catchAsyncError(async (req,res,next)=>{

    const user = await userModel.findById(req.user._id).select("+password")
    // console.log(user)

    const {oldPassword,newPassword,confirmPassword}=req.body

    if(!oldPassword||!newPassword||!confirmPassword){
        return next(new ErrorHandler("Please enter all fields",400))
    }
    
    const isPasswordMatched = await user.comparePassword(oldPassword)

    // console.log(isPasswordMatched)

    if(!isPasswordMatched){
        return next(new ErrorHandler('Password not matched',400))
    }

    if(newPassword !== confirmPassword){
        return next(new ErrorHandler('Confirm password not matched',400))
    }

    user.password = newPassword;
    await user.save()

    res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })
})


// Update user Profile
const updateUserProfile = catchAsyncError(async (req,res,next)=>{
    const newUserDaa = {name:req.body.name,email:req.body.email}

    //Cloudinary Avatar will added later

    const user = await userModel.findByIdAndUpdate(req.user.id,newUserDaa,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
        user,
        message:"Profile updated successfully"
    })
})

// Update profile picture
const updateProfilePicture = catchAsyncError(async(req,res,next)=>{

    const user = await userModel.findById(req.url._id)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    const file= req.files.avatar
    
    const myCloud = await cloudinary.v2.uploader.upload(file.tempFilePath)

    user.avatar={
        public_id:myCloud.public_id,
        url : myCloud.secure_url
    }

    await user.save()

    res.status(200).json({
        success:true,
        message:"Profile picture updated successfully"
    })
})

// Forget Password
const forgetPassword = catchAsyncError(async(req,res,next)=>{

    const {email} = req.body

    const user = await userModel.findOne({email:email})

    
    if(!user){
        return next(new ErrorHandler("User not found",400))
    }
    

    const resetToken = await user.getPasswordResetToken()

    await user.save()

    const url = `${process.env.FRONT_END_URL}/resetpassword/${resetToken}`
    const message = `Click to the link to reset your password.\n ${url}.\n If you not requested then ignore it.`

    // send token via email
    await sendEmail(user.email,"Password Reset Token",message)

    res.status(200).json({
        success:true,
        resetToken,
        message:`Reset token send successfully to ${email}`
    })
})

// Reset Password
const resetPassword = catchAsyncError(async(req,res,next)=>{
    const {token} = req.params

    const ResetPasswordToken = createHash('sha512').update(token).digest('hex')

    
    const user = await userModel.findOne({ResetPasswordToken,ResetPasswordExpire:{
        $gt:Date.now()
    }})

    if(!user){
        return next(new ErrorHandler("Token is invalid or Expired",401))
    }

    user.password = req.body.password

    user.ResetPasswordToken = undefined
    
    user.ResetPasswordExpire = undefined

    await user.save()

    res.status(200).json({
        success:true,
        message:`Password changed successfully`
    })

})

const addToPlayList = catchAsyncError(async(req,res,next)=>{
    const user = await userModel.findById(req.user._id)

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    const course = await courseModel.findById(req.body.id)

    if(!course){
        return next(new ErrorHandler("Course id is invalid ",404))
    }

    const isCourseExist = user.playList.find((item)=>{
        if(item.course.toString()===course._id.toString()) return true
    })

    if(isCourseExist){
        return next(new ErrorHandler("Course already exist ",409))
    }

    user.playList.push({
        course:course._id,
        poster:course.poster.url
    })

    await user.save()

    res.status(200).json({
        success:true,
        message:`Course added successfully to playlist`
    })
})

const removeFromPlayList = catchAsyncError(async(req,res,next)=>{
    const user = await userModel.findById(req.user._id)

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    const course = await courseModel.findById(req.params.id)

    if(!course){
        return next(new ErrorHandler("Course is not exist ",404))
    }

    const newPlayList = user.playList.filter((item)=>{
        if(item.course.toString()!==course._id.toString()) return item
    })

    user.playList=newPlayList

    await user.save()

    res.status(200).json({
        success:true,
        message:`Course remove successfully to playlist`
    })
})

// Get All Users
const getAllUser = catchAsyncError(async(req,res,next)=>{

    const user = await userModel.find({role:'user'})


    res.status(200).json({
        success:true,
        message:`All Users`,
        user
    })
})

// Update User Role
const updateUserRole = catchAsyncError(async(req,res,next)=>{

    const user = await userModel.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    if(user.role==='admin')user.role='user'
    else user.role='admin'

    await user.save()

    res.status(200).json({
        success:true,
        message:`User role updated`,
    })
})

// Update User Role
const deleteUser = catchAsyncError(async(req,res,next)=>{

    const user = await userModel.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    // cancel subscription

    await user.remove()

    res.status(200).json({
        success:true,
        message:`User deleted`,
    })
})


// Update User Role
const deleteMe = catchAsyncError(async(req,res,next)=>{

    const user = await userModel.findById(req.user._id)

    
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    // cancel subscription

    await user.remove()

    res.status(200).cookie('token',null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:`User deleted`,
    })
})

userModel.watch().on('change',async()=>{
    const stats = await statModel.find({}).sort({createdAt:'desc'}).limit(1)

    const subscription = await userModel.find({'subscription.status':'activate'})

    stats[0].users = await userModel.countDocuments()
    stats[0].subscription = subscription.length
    stats[0].createdAt = new Date(Date.now())

    await stats[0].save()
})
export {deleteMe,deleteUser,updateUserRole,getAllUser,removeFromPlayList,addToPlayList,userDetails,userRegister,loginUser,logoutUser,updatePassword,updateUserProfile,updateProfilePicture,forgetPassword,resetPassword}