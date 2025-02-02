const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Singer = require("../models/singerModel");
const Appointment = require("../models/appointmentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadImageOnCloudinary } = require("../middlewares/cloudinaryHelper");
const { upload } = require("../middlewares/multerMiddleware");
const multer=require("multer")


router.post('/register',upload.single("profilePicture"), async (req, res) => {
    try {
        const picture=req.file?.fieldname;
        const picturePath=req.file?.path;
        const {name,email,password,phoneNumber,address}=req.body;

        if(!name || !email || !password || !phoneNumber || !address || !picture || !picturePath){
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

        const password1 = req.body.password;

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password1, salt);

        req.body.password = hashedPassword;

        const {secure_url,public_id}=await uploadImageOnCloudinary(picturePath,"images");

        if(!secure_url){
            return res.status(400).send({
                success:false,
                message:"Error while uploading image",
                error:secure_url
            })
        }


        // const newuser = await User(req.body);
        const newuser = await User({
            name,
            email,
            password,
            phoneNumber,
            address,
            profilePicture:{
                secure_url,
                public_id
            }
        });
        await newuser.save();

        res.status(200).send({
            message: "User created successfully",
            success: true
        })
    } catch (error) {
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

router.post('/apply-singer-account',upload.single("profilePicture"),authMiddleware, async (req, res) => {
    try {
        const picture=req.file?.fieldname;
        const picturePath=req.file?.path;
        const {userId,firstName,lastName,phoneNumber,address,experience,feePerCunsultation}=req.body;

        if(!userId || !firstName || !lastName || !phoneNumber || !address || !experience || !feePerCunsultation || !picture || !picturePath){
            return res.status(400).send({
                success:false,
                message:"All fields are required"
            })
        }


        const {secure_url,public_id}=await uploadImageOnCloudinary(picturePath,"images");

        if(!secure_url){
            return res.status(400).send({
                success:false,
                message:"Error while uploading image",
                error:secure_url
            })
        }

        const newsinger=await Singer.create({
            userId,
            firstName,
            lastName,
            profilePicture:{
                secure_url,
                public_id
            },
            phoneNumber,
            address,
            experience,
            feePerCunsultation,
            status:"pending"
        });

        const adminuser = await User.findOne({ isAdmin: true });
        const unseenNotifications = adminuser.unseenNotifications;
        unseenNotifications.push({
            type: "new-singer-request",
            message: `${newsinger.firstName} ${newsinger.lastName} has applied for a singer account`,
            data: {
                singerId: newsinger._id,
                name: newsinger.firstName + " " + newsinger.lastName
            },
            onClickPath: '/admin/singerlist'
        })
        await adminuser.save();
        res.status(200).send({
            success: true,
            message: "Singer account applied successfully",
            data:newsinger
        })
    } catch (error) {
        console.log(error) 
        res.status(500).send({
            success: false,
            message: "Error applying singer account"
        })
    }
})

router.post('/mark-all-notifications-as-seen', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        const unseenNotifications = user.unseenNotifications;
        const seenNotifications = user.seenNotifications;
        user.seenNotifications.push(...unseenNotifications);
        user.unseenNotifications = [];
        user.seenNotifications = seenNotifications;
        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).send({
            success: true,
            message: "All notifications marked as seen",
            data: updatedUser
        })
    } catch (error) {
        res.status(500).send({
            message: "Error in notification seen",
            success: false
        })
    }
})

router.post('/delete-all-notifications', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        user.seenNotifications = [];
        user.unseenNotifications = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).send({
            success: true,
            message: "Deleted all notifications",
            data: updatedUser
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in delete notifications"
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

        const user = await User.findOne({ _id: req.body.singerInfo.userId });
        user.unseenNotifications.push({
            type: "new-appointment-request",
            message: `A new appointment request has been made by ${req.body.userInfo.name}`,
            onClickPath: "/singer/appointments"
        })

        await user.save();

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