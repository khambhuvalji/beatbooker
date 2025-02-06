const express=require("express");
const app=express();
require('dotenv').config()
const dbConfig=require('./config/dbConfig')
const cors=require("cors");
const bodyParser=require("body-parser");
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const userRoute=require("./routes/userRoute");
const singerRoute=require("./routes/singerRoute")
const adminRoute=require("./routes/adminRoute")
const messageRoute=require("./routes/messageRoute")


app.use("/api/user",userRoute);
app.use("/api/singer",singerRoute);
app.use("/api/admin",adminRoute);
app.use("/api/message",messageRoute)
const port=process.env.PORT || 5000;

app.listen(port,()=>console.log(`Node server started at port ${port}`));