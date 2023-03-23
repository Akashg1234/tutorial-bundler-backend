export const sendToken=(user,statusCode,message,res)=>{
    const token = user.getJWToken()

    const options ={
        expires:new Date(
            Date.now()+15*24*60*60*1000
        ),
        httpOnly:true,
    }
    
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        message,
        user,
        token
    })
}