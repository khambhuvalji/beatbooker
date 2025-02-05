const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Singer = require("../models/singerModel");
const Appointment = require("../models/appointmentModel");
const Admin=require("../models/adminModel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadImageOnCloudinary, deleteImageOnCloudinary } = require("../middlewares/cloudinaryHelper");
const { upload } = require("../middlewares/multerMiddleware");
const multer=require("multer")


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

        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            return res.status(200).send({
                message: "User already exist",
                success: false
            })
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // const newuser = await User(req.body);
        const newuser = await User({
            name,
            email,
            password:hashedPassword
        });
        await newuser.save();

        res.status(200).send({
            message: "User created successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Error user creating",
            success: false
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).send({
                message: "User does not exist",
                success: false
            })
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(200).send({
                message: "Password is incorrent",
                success: false
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1y' })

        res.cookie("jwt",token,{
            httpOnly:true
        })

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

router.post("/update-user-profile",authMiddleware, upload.single("profilePicture"), async (req, res) => {
    try {
        const picturePath = req.file?.path;
        const {name,phoneNumber, address} = req.body;

        const user = await User.findOne({ _id: req.body.userId });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            })
        }

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;

        if (picturePath) {
            const { secure_url, public_id } = await uploadImageOnCloudinary(picturePath, "images");

            if (user.profilePicture && user.profilePicture.public_id) {
                await deleteImageOnCloudinary(user.profilePicture.public_id)
            }


            user.profilePicture = {
                secure_url, public_id
            }
        }

        await user.save();

        res.status(200).send({
            success: true,
            message: "Singer profile updated successfully",
            data: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in singer profile update",
            error
        })
    }
})

router.post('/get-user-info-by-id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        user.password = undefined;

        if (!user) {
            return res.status(200).send({
                message: "User does not exist",
                success: false
            })
        }
        else {
            return res.status(200).send({
                success: true,
                data: user
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Error user info",
            success: false,
            error
        })
    }

})

router.get('/get-all-approved-singers', authMiddleware, async (req, res) => {
    try {
        const singers = await Singer.find({ status: "approved" });

        res.status(200).send({
            success: true,
            message: "All approved singer fetched successfully",
            data: singers
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in fetched approve singer"
        })
    }
})

router.post('/book-appointment', authMiddleware, async (req, res) => {
    try {
        req.body.status = "pending";
        req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        req.body.time = moment(req.body.time, "HH:mm").toISOString();
        const newAppointment = await Appointment(req.body);
        await newAppointment.save();

        // const user = await User.findOne({ _id: req.body.singerInfo.userId });
        // user.unseenNotifications.push({
        //     type: "new-appointment-request",
        //     message: `A new appointment request has been made by ${req.body.userInfo.name}`,
        //     onClickPath: "/singer/appointments"
        // })
        // await user.save();

        res.status(200).send({
            success: true,
            message: "Book appointment successfully"
        })

    } catch (error) {
        res.status(500).send({
            message: "Error booking appointment",
            success: false
        })
    }
})

router.post("/check-booking-availability", authMiddleware, async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        const fromTime = moment(req.body.time, "HH:mm").substrct(8, 'hours').toISOString();
        const toTime = moment(req.body.time, "HH:mm").add(8, 'hours').toISOString();

        const singerId = req.body.singerId;
        const appointments = await Appointment.find({
            doctorId,
            date,
            time: { $gte: fromTime, $lte: toTime }
        })

        if (appointments.length > 0) {
            return res.status(200).send({
                message: "Appointments not available",
                success: false
            })
        }
        else {
            return res.status(200).send({
                message: "Appointments available",
                success: true
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Error booking appointment",
            success:false
        })
    }
})

router.get("/get-appointments-by-user-id",authMiddleware,async(req,res)=>{
    try {
        const appointments=await Appointment.find({userId:req.body.userId});

        res.status(200).send({
            success:true,
            message:"Appointments fetched successfully",
            data:appointments
        })

    } catch (error) {
        res.status(500).send({
            message:"Error fetching appointments",
            success:false
        })
    }
})

router.get("/search-singers/:key",authMiddleware,async(req,res)=>{
    try {
        const search=req.params.key;

        const singer=await Singer.find({
            "$or":[
                {"firstName":{$regex:req.params.key}},
                {"lastName":{$regex:req.params.key}},
                {"address":{$regex:req.params.key}},
                {"feePerCunsultation":{$regex:req.params.key}},
            ]
        })

        res.status(200).send({
            success:true,
            data:singer
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in search singers"
        })
    }
})



module.exports = router;