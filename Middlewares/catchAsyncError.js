export const catchAsyncError= (thisFunction)=>(req,res,next)=>{
    Promise.resolve(thisFunction(req,res,next)).catch(next)
}