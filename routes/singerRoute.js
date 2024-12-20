const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Singer = require("../models/singerModel");

router.post("/get-singer-info-by-user-id", authMiddleware, async (req, res) => {
    try {
        const singer = await Singer.findOne({ userId: req.body.userId });
        res.status(200).send({
            message: "Singer info fetched successfully",
            success: true,
            data: singer
        })
    } catch (error) {
        res.status(500).send({
            message: "Error getting singer info",
            success: false,
            error
        })
    }
})

router.post("/get-singer-info-by-id", authMiddleware, async (req, res) => {
    try {
        const singer = await Singer.findOne({ _id: req.body.singerId });
        res.status(200).send({
            success: true,
            message: "Singer info fetched successfully",
            data: singer
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error getting singer info"
        })
    }
})

router.post("/update-singer-profile",authMiddleware,async(req,res)=>{
    try {
        const singer=await Singer.findOneAndUpdate(
            {userId:req.body.userId},req.body
        )

        res.status(200).send({
            success:true,
            message:"Singer profile updated successfully",
            data:singer
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in singer profile update",
            error
        })
    }
})

module.exports = router;