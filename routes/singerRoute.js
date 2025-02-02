const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Singer = require("../models/singerModel");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const { upload } = require("../middlewares/multerMiddleware");
const { uploadImageOnCloudinary, deleteImageOnCloudinary, cloudinary, deleteVideoOnCloudinary } = require("../middlewares/cloudinaryHelper");
const multer = require("multer");
const { uploada } = require("../middlewares/cloudinaryHelper")
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
const pathWithNullBytes = "\x00\x00some/path";
const cleanedPath = pathWithNullBytes.replace(/\x00/g, '');


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

router.post("/update-singer-profile", upload.single("profilePicture"), authMiddleware, async (req, res) => {
    try {
        const picturePath = req.file?.path;
        const { userId, firstName, lastName, phoneNumber, address, experience, feePerCunsultation } = req.body;

        const singer = await Singer.findOne({ userId: req.body.userId });

        if (!singer) {
            return res.status(404).send({
                success: false,
                message: "Singer not found"
            })
        }

        if (firstName) singer.firstName = firstName;
        if (lastName) singer.lastName = lastName;
        if (phoneNumber) singer.phoneNumber = phoneNumber;
        if (address) singer.address = address;
        if (experience) singer.experience = experience;
        if (feePerCunsultation) singer.feePerCunsultation = feePerCunsultation;

        if (picturePath) {
            const { secure_url, public_id } = await uploadImageOnCloudinary(picturePath, "images");

            if (singer.profilePicture && singer.profilePicture.public_id) {
                await deleteImageOnCloudinary(singer.profilePicture.public_id)
            }


            singer.profilePicture = {
                secure_url, public_id
            }
        }

        await singer.save();

        res.status(200).send({
            success: true,
            message: "Singer profile updated successfully",
            data: singer
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

router.post("/singer-post-videos", uploada.array("videos", 5), authMiddleware, async (req, res) => {
    try {
        const videos = req.files;
        const videosa = [];

        const singer = await Singer.findOne({ userId: req.body.userId });

        if (!singer) {
            return res.status(404).send({
                success: false,
                message: "Singer not found"
            })
        }

        if (singer.videos.length > 4) {
            return res.status(400).send({
                success: false,
                message: "video maximum length is 5 then not uploads videos"
            })
        }



        for (const video of videos) {
            const result = await cloudinary.uploader.upload(video.path, {
                resource_type: 'video',
                folder: "videos"
            });
            videosa.push(result.secure_url);
        }

        singer.videos.push(videosa);
        singer.save();

        res.status(200).send({
            success: true,
            message: "singer post video successfully",
            data: singer
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in singer post video",
            error
        })
    }
})

const uploadb=multer({dest:'/upload/videos'})

router.post('/singer-delete-video',authMiddleware,uploadb.single('videos'),async(req,res)=>{
    try {
        const id=req.body.userId;
        const video=req.file;

        const singer = await Singer.findOne({ userId: req.body.userId });

        if (!singer) {
            return res.status(404).send({
                success: false,
                message: "Singer not found"
            })
        }

        // for (const video of singer.videos) {
        //     if(videosa === video){
        //         const result=await deleteVideoOnCloudinary(videosa);
        //         singer.videos.pull(result);
        //     }
        // }

        const videoIndex=singer.videos.find((v)=>v===video.originalname);

        if(videoIndex === -1){
            return res.status(400).send({
                success:false,
                message:"Video not found",
                data:videoIndex,
                data:singer
            })
        }

        cloudinary.uploader.destroy(video.originalname,(error,result)=>{
            if(error){
                console.log(error)
            }
            else{
                console.log(`Video deleted successfully:${video.originalname}`)
            }
        });

        singer.videos.splice(videoIndex,1);
        singer.save()



        // singer.videos.pull(videosa);
        // await singer.save()

        res.status(200).send({
            success:true,
            message:"video deleted successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in singer deleted videos"
        })
    }
})

router.get("/get-appointments-by-singer-id", authMiddleware, async (req, res) => {
    try {
        const singer = await Singer.findOne({ userId: req.body.userId });
        const appointments = await Appointment.find({ singerId: singer._id });

        res.status(200).send({
            success: true,
            message: "Appointments fetched successfully",
            data: appointments
        })
    } catch (error) {
        res.status(500).send({
            message: "Error fetching appointments",
            success: false
        })
    }

})

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
            status
        });

        const user = await User.findOne({ _id: appointment.userId });
        const unseenNotifications = user.unseenNotifications;
        unseenNotifications.push({
            type: "appointment-status-changed",
            message: `Your appointment status has been ${status}`,
            onClickPath: "/appointments"
        })
        await user.save();

        res.status(200).send({
            success: true,
            message: "Appointment status updated successfully"
        })
    } catch (error) {
        res.status(500).send({
            message: "Error changing appointment status",
            success: false
        })
    }

})

module.exports = router;