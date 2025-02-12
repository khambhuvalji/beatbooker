const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Singer = require("../models/singerModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Admin = require("../models/adminModel");
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

router.post('/register', async (req, res) => {
    try {
        const name=req.body.name;
        const email=req.body.email;
        const password = req.body.password;


        if(!name || !email || !password){
            return res.status(400).send({
                success:false,
                message:"All fields are required"
            })
        }

        const adminExist = await Admin.findOne({ email: req.body.email });
        if (adminExist) {
            return res.status(200).send({
                message: "admin already exist",
                success: false
            })
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // const newuser = await User(req.body);
        const newadmin = await Admin({
            name,
            email,
            password:hashedPassword
        });
        await newadmin.save();

        res.status(200).send({
            message: "admin created successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Error admin creating",
            success: false
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) {
            return res.status(200).send({
                message: "Admin does not exist",
                success: false
            })
        }

        const isMatch = await bcrypt.compare(req.body.password, admin.password);

        if (!isMatch) {
            return res.status(200).send({
                message: "Password is incorrent",
                success: false
            })
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1y' })

        res.status(200).send({
            message: "Login successfully",
            success: true,
            data: token
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send({
            message: "Error in login",
            success: false,
            error
        })
    }

})

router.get("/get-all-pending-singers", authMiddleware, async (req, res) => {
    try {
        const singers = await Singer.find({status:"pending"});

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

router.get("/get-all-approved-singers", authMiddleware, async (req, res) => {
    try {
        const singers = await Singer.find({status:"approved"});

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
        await singer.save()

        res.status(200).send({
            success:true,
            message:"Singer account status updated successfully",
            data:singer
        }) 
    } catch (error) {
        
        console.log(error)
        res.status(500).send({
            success:false,
            message:`Error in singer status update ${error.message}`,
            error
        })
    }
})

router.post("/block-singer-account",authMiddleware,async(req,res)=>{
    try {
        const {singerId,status}=req.body;
        const singer=await Singer.findByIdAndUpdate(singerId,{
            status
        });
        await singer.save()

        res.status(200).send({
            success:true,
            message:"Singer account is blocked",
            data:singer
        }) 
    } catch (error) {
        
        console.log(error)
        res.status(500).send({
            success:false,
            message:`Error in singer status update ${error.message}`,
            error
        })
    }
})

module.exports = router;