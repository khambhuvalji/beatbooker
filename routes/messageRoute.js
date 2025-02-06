const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/authMiddleware")
const User = require("../models/userModel")
const Singer = require("../models/singerModel")
const Message = require("../models/messageModel")


router.post("/send-message", authMiddleware, async (req, res) => {
    try {
        const { senderId, receiverId, messages } = req.body;

        const sender = await User.findById(senderId) || await Singer.findById(senderId);
        const receiver = await User.findById(receiverId) || await Singer.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).send({
                success: false,
                message: "Sender or receiver not found"
            })
        }

        const newMessage = new Message({ senderId, receiverId, messages });
        await newMessage.save();

        sender.messages.push(newMessage._id)
        receiver.messages.push(newMessage._id)

        await sender.save()
        await receiver.save()

        res.status(200).send({
            success: true,
            message: "Message sending successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in sending message"
        })
    }
})

router.get("/message/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate("messages");
        const singer = await Singer.findById(userId).populate("messages");

        if (!user && !singer) {
            return res.status(404).send({
                success: false,
                message: "User or singer not found"
            })
        }

        const message = user ? user.messages : singer.messages;

        res.status(200).send({
            success: true,
            message: "message fetched successfully",
            data: message
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in fetched message"
        })
    }
})

module.exports = router