import { Schema,model } from "mongoose";
import validator from "validator";

const schema = new Schema({
    title:{
        type:'String',
        required:[true,'Please enter the title'],
        minLength:[10,"Title must be atleat 10 charecter"],
        maxLength:[60,"Title must be within 60 charecter"]
    },
    description:{
        type:'String',
        required:[true,'Please enter the description'],
        minLength:[10,"Description must be atleat 10 charecter"],
    },
    lectures:[
        {
            title:{
                type:'String',
                required:[true,'Please enter the title']
            },
            description:{
                type:String,
                required:true
            },
            video:{
                public_id:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                },
            }
        }
    ],
    poster:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
    },
    subscription:{
        id:'String',
        status:'String'
    },
    avatar:{
        public_id:{
            type:'String',
            required:true,
            default:"public_id"
        },
        url:{
            type:'String',
            required:true,
            default:"image url"
        }
    },
    views:{
        type:Number,
        default:0
    },
    noOfVideos:{
        type:Number,
        default:0
    },
    category:{
        type:'String',
        required:true
    },
    createdBy:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    

})

export const courseModel = new model('Course',schema)