const mongoose=require("mongoose")

const reviewSchema = new mongoose.Schema({
    singerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Singer", 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
          required: true
    },
    reviewText: { type: String, 
        required: true 
    },
  });

  const reviewModel=mongoose.model("reviews",reviewSchema);
  module.exports=reviewModel;
  