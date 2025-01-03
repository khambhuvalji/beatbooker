const mongoose=require("mongoose");

const singerSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    feePerCunsultation:{
        type:String,
        required:true
    },
    posts:{
        type:Array,
        default:[]
    },
    messages:{
        type:Array,
        default:[]
    },
    status:{
        type:String,
        default:"pending"
    }
},{timestamps:true})

const singerModel=mongoose.model("singers",singerSchema);
module.exports=singerModel;