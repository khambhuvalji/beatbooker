const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Singer = require("../models/singerModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-singers", authMiddleware, async (req, res) => {
    try {
        const singers = await Singer.find({});

        res.status(200).send({
            success: true,
            message: "singers fetched successfully",
            data: singers
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in fetched singers",
            error
        })
    }
})

router.get("/get-all-users",authMiddleware,async(req,res)=>{
    try {
        const users=await User.find({});

        res.status(200).send({
            success:true,
            message:"Users fetched successfully",
            data:users
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in users fetched",
            error
        })
    }
})

router.post("/change-singer-account-status",authMiddleware,async(req,res)=>{
    try {
        const {singerId,status}=req.body;
        const singer=await Singer.findByIdAndUpdate(singerId,{
            status
        });

        const user=await User.findOne({_id:singer.userId});
        const unseenNotifications=user.unseenNotifications;
        unseenNotifications.push({
            type:"new-singer-request-changed",
            message:`Your Singer account has been ${status}`,
            onClickPath:""
        })

        user.isSinger=status==="approved"?true:false;
        await user.save();

        res.status(200).send({
            success:true,
            message:"Singer account status updated successfully",
            data:singer
        }) 
    } catch (error) {
        console.log(error.message)
        res.status(500).send({
            success:false,
            message:`Error in singer status update ${error.message}`,
            error
        })
    }
})

module.exports = router;