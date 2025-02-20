const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Review = require("../models/reviewModel")

router.post("/reviews", authMiddleware, async (req, res) => {
    try {
        const { singerId, userId, reviewText } = req.body;

        if (!singerId || !userId || !reviewText) {
            return res.status(400).send({
                error: "All fields are required",
                success: false
            });
        }

        const review = new Review({ singerId, userId, reviewText });
        await review.save();

        res.status(200).send({
            success: true,
            message: "Review added successfully",
            data: review
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            error: "Internal Server Error"
        });
    }
});

router.get("/reviews/:singerId",authMiddleware, async (req, res) => {
    try {
      const reviews = await Review.find({ singerId: req.params.singerId }).populate("userId", "name");

      res.status(200).send({
        success: true,
        message: "Review fetched successfully",
        data: reviews
    });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error: "Internal Server Error"
        });
    }
  });



module.exports = router;