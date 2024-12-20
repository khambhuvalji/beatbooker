const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Singer = require("../models/singerModel");
const Appointment=require("../models/appointmentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware")


router.post('/register', async (req, res) => {
    try {
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            return res.status(200).send({
                message: "User already exist",
                success: false
            })
        }

        const password = req.body.password;

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        req.body.password = hashedPassword;

        const newuser = await User(req.body);
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

router.post('/apply-singer-account', authMiddleware, async (req, res) => {
    try {
        const newsinger = await Singer({ ...req.body, status: "pending" });
        await newsinger.save();

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
            message: "Singer account applied successfully"
        })
    } catch (error) {
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

router.get('/get-all-approved-singers',authMiddleware,async(req,res)=>{
    try {
        const singers=await Singer.find({status:"approved"});

        res.status(200).send({
            success:true,
            message:"All approved doctor fetched successfully",
            data:singers
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in fetched approve doctor"
        })
    }
})

router.post('/book-appointment',authMiddleware,async(req,res)=>{
    try {
        req.body.status="pending";
        const newAppointment=await Appointment(req.body);
        await newAppointment.save();

        const user=await User.findOne({_id:req.body.singerInfo.userId});
        user.unseenNotifications.push({
            type:"new-appointment-request",
            message:`A new appointment request has been made by ${req.body.userInfo.name}`,
            onClickPath:"/singer/appointments"
        })

        await user.save();

        res.status(200).send({
            success:true,
            message:"Book appointment successfully"
        })

    } catch (error) {
        res.status(500).send({
            message:"Error booking appointment",
            success:false
        })
    }
})




module.exports = router;