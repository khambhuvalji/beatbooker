const express=require("express");
const app=express();
require('dotenv').config()
const dbConfig=require('./config/dbConfig')
app.use(express.json())
const userRoute=require("./routes/userRoute");
const singerRoute=require("./routes/singerRoute")
const adminRoute=require("./routes/adminRoute")


app.use("/api/user",userRoute);
app.use("/api/singer",singerRoute);
app.use("/api/admin",adminRoute);
const port=process.env.PORT || 5000;

app.listen(port,()=>console.log(`Node server started at port ${port}`));