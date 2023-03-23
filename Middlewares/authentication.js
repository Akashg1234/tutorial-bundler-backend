import jwt from "jsonwebtoken";
import {userModel} from'../Models/User.js'
import ErrorHandler from '../Utils/errorHandler.js';
import {catchAsyncError} from "../Middlewares/catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req,res,next)=>{
    const {token}=req.cookies

    // console.log(token)

    if(!token){
        return next(new ErrorHandler('Please login to access the resource',401))
    }

    let decodedData=null
    try {
        decodedData = jwt.verify(token,process.env.JWT_SECRET_KEY)
    } catch (error) {
        console.log(error.message)
    }
    
    req.user = await userModel.findById(decodedData.jwt_id)

    // console.log(decodedData,"---",req.user)

    next()
});

export const authorizedRoles = (...roles) =>{

    return (req,res,next)=>{

        // console.log(req)

        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(` Roles: ${(req.user.role)} is not allowed to access this resource`,401));
        }
        next();
    }
}

export const authorizedSubscriber = () =>{

    return (req,res,next)=>{

        if(req.user.role!=='admin' && req.user.subscription.status!=='active'){
            return next(new ErrorHandler(` Only subscribers allowed to access this resource`,401));
        }
        next();
    }
}

