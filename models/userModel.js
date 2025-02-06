const mongoose=require("mongoose");
const validator=require("validator")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:(value)=>{
            if(!validator.isEmail(value)){
                throw Error("Email is not in proper format")
            }
        }
    },
    password:{
        type:String,
        required:true,
        // validate:(value)=>{
        //     return(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$#])[A-Za-z\d@$#]{8,}$/.test(value))
        // }
    },
    phoneNumber:{
        type:Number,
        default:"",
        // validate:(value)=>{
        //     return(/^\d{10}$/.test(value.toString()))
        // }
    },
    address:{
        type:String,
        default:""
    },
    profilePicture:{
        secure_url:{
            type:String,
            default:""
        },
        public_id:{
            type:String,
            default:""
        }
    },
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"messages"
    }]
},{timestamps:true});

const userModel=mongoose.model("users",userSchema);
module.exports=userModel;
