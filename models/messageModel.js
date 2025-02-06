const mongoose=require("mongoose")

const messageSchema=new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    messages:{
        type:String,
        required:true
    }
})

const Message=mongoose.model("messages",messageSchema)

module.exports=Message