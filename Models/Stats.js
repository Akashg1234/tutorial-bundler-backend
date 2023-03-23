import { Schema,model } from "mongoose";
import validator from "validator";

const schema = new Schema({
    users:{
        type:Number,
        default:0
    },

    subscription:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

})

export const statModel = new model('Stat',schema)