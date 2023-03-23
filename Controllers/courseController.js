import {courseModel} from '../Models/Course.js'
import {catchAsyncError} from '../Middlewares/catchAsyncError.js'
import ErrorHandler from '../Utils/errorHandler.js'
import cloudinary from 'cloudinary'
import { statModel } from '../Models/Stats.js'

const getAllCourses= catchAsyncError(async(req,res,next)=>{

    const keyword=req.query.keyword || ""
    const category=req.query.category || ""

    const courses = await courseModel.find({
        title:{
            $regex:keyword,
            $options:'i'
        },
        category:{
            $regex:category,
            $options:'i'
        },
    }).select('-lectures')

    res.status(200).json({
        success:true,
        courses
    })
})


const createCourse= catchAsyncError(async(req,res,next)=>{

    
    const {title,description,category,createdBy} = req.body
    const file= req.files.poster

    if(!title||!description||!category||!createdBy||!file)
        return next(new ErrorHandler("Please enter all fields",400))
     
    const myCloud = await cloudinary.v2.uploader.upload(file.tempFilePath)
    
    const course = await courseModel.create({
        title,
        description,
        category,
        createdBy,
        poster:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    })

    res.status(201).json({
        success:true,
        course,
        message:"Course Created Successfully..."
    })
})

const getCourseLecture= catchAsyncError(async(req,res,next)=>{

    const course = await courseModel.findById(req.params.id)

    if(!course){
        return next(new ErrorHandler("Course not found",404))
    }

    course.views+=1

    await course.save()

    res.status(200).json({
        success:true,
        lectures:course.lectures
    })
})

const addCourseLecture= catchAsyncError(async(req,res,next)=>{

    const {id} = req.params.id
    const {title,description} = req.body

    const file= req.files.lec_video

    if(!title||!description||!file)
        return next(new ErrorHandler("Please enter all fields",400))
    
    const myCloud = await cloudinary.v2.uploader.upload(file.tempFilePath,{
        resource_type:'video'
    })

    const course = await courseModel.findById(id)

    if(!course){
        return next(new ErrorHandler("Course not found",404))
    }

    course.lectures.push({
        title,
        description,
        video:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    })

    course.noOfVideos = course.lectures.length

    await course.save()

    res.status(200).json({
        success:true,
        message:"Lectur added successfully to the course"
    })
})

const deleteCourse= catchAsyncError(async(req,res,next)=>{

    
    const {id} = req.params.id
    const course = await courseModel.findById(id)

    if(!course){
        return next(new ErrorHandler("Course not found",404))
    }
     
    await cloudinary.v2.uploader.destroy(course.poster.public_id)

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i];
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
            resource_type:'video'
        })
    }
    
    await course.remove()

    res.status(201).json({
        success:true,
        course,
        message:"Course deleted successfully..."
    })
})

const deleteLecture = catchAsyncError(async(req,res,next)=>{
    const {courseId,lectureId} = req.query
    const course = await courseModel.findById(courseId)

    if(!course){
        return next(new ErrorHandler("Course not found",404))
    }

    const lecture = course.lectures.find(item=>{
        if(item._id.toString()===lectureId.toString()) return item
    })

    course.lectures = course.lectures.filter(item=>{
        if(item._id.toString()!==lectureId.toString()) return item
    })
    await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
        resource_type:'video'
    })

    course.noOfVideos = course.lectures.length

    await course.save()

})

courseModel.watch().on('change',async()=>{
    const stats = await statModel.find({}).sort({createdAt:'desc'}).limit(1)

    const course = await courseModel.find({})

    let totalViews = 0

    for (let i = 0; i < course.length; i++) {
        totalViews += course[i].views;
        
    }

    stats[0].views=totalViews
    stats[0].createdAt = new Date(Date.now())

    await stats[0].save()

})
export {getAllCourses,createCourse,getCourseLecture,addCourseLecture,deleteCourse}