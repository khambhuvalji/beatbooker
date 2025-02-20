const mongoose = require("mongoose");
const validator = require("validator")

const singerSchema = new mongoose.Schema({
    // userId:{
    //     type:String,
    //     required:true
    // },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw Error("Email is not in proper format")
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    profilePicture: {
        secure_url: {
            type: String,
            default: ""
        },
        public_id: {
            type: String,
            default: ""
        }
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    experience: {
        type: String,
        default: ""
    },
    feePerCunsultation: {
        type: String,
        default: ""
    },
    identifyVideo: [{
        type: Array,
        default:[],
        length: 1
    }],
    videos: [{
        type: Array,
        default:[],
        length: 4
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages"
    }],
    status: {
        type: String,
        default: "pending"
    }
}, { timestamps: true })

const singerModel = mongoose.model("singers", singerSchema);
module.exports = singerModel;