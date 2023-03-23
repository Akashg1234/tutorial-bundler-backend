import { Schema,model } from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {createHash,randomBytes} from 'crypto'

const schema = new Schema({
    name:{
        type:'String',
        required:[true,'Please enter your name']
    },
    email:{
        type:'String',
        required:[true,'Please enter your email'],
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:'String',
        required:[true,'Please enter your password'],
        minLength:[8,'password must be atleast 8 charecter'],
        select:false
    },
    role:{
        type:'String',
        enum:['admin','user'],
        default:'user'
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
            default:"url"
        }
    },
    playList:[
        {
            course:{
                type:Schema.Types.ObjectId,
                ref:'Course'
            },
            poster:String
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    },
    ResetPasswordToken:String,
    ResetPasswordExpire:String

})

// Hashing password before hash

schema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password,15)
    next()
})

// Generating jwt token

schema.methods.getJWToken=function () {
    return jwt.sign({jwt_id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:'15d'
    })
}

// Generating password reset token

schema.methods.getPasswordResetToken = function () {
    

    const resetToken = randomBytes(100).toString('hex')

    
    this.ResetPasswordToken = createHash('sha512').update(resetToken).digest('hex')
    
    this.ResetPasswordExpire = Date.now()+ 15*60*1000
    
    return resetToken;

}

// Comparing password

schema.methods.comparePassword = async function(enteredPassword){
    // console.log(enteredPassword)

    return await bcrypt.compare(enteredPassword,this.password)
}


export const userModel = new model('User',schema)
