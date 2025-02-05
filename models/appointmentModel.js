const mongoose=require("mongoose");

const appointmentSchema=new mongoose.Schema({
    singerId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    singerInfo:{
        type:Object,
        required:true
    },
    userInfo:{
        type:Object,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:"pending"
    }
},{timestamps:true})

const appointmentModel=mongoose.model("appointments",appointmentSchema);
module.exports=appointmentModel;