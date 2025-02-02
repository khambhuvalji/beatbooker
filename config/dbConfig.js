const mongoose=require("mongoose");
const bodyParser=require("body-parser")
const express=require("express")
const app=express();

mongoose.connect(process.env.MONGO_URL);

const connection=mongoose.connection;

connection.on("connected",()=>{
    useNewUrlParser:true,
    console.log("mongoDB is connected");
    useUnifiedTopology:true
})

app.use(bodyParser.json());

connection.on("error",(error)=>{
    console.log("Error in mongoDB ",error);
})

module.exports=mongoose;