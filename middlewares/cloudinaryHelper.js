const {v2:cloudinary}=require("cloudinary");
const fs=require("fs");
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadImageOnCloudinary=async (filePath,folderName)=>{
    try {
        const result=await cloudinary.uploader.upload(filePath,{
            folder:folderName
        })

        try {
            fs.unlinkSync(filePath)
        } catch (error) {
            console.log("Failed to delete image from server",error)
        }
        return{
            secure_url:result.secure_url,
            public_id:result.public_id
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

const deleteImageOnCloudinary=async(public_id)=>{
    try {
        const result=await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        throw new Error(error)
    }
}

const storage = multer.diskStorage({
    dest:'upload/videos',
    limits:{fieldSize:1024*1024*5}
})
const uploada=multer({storage:storage})

const deleteVideoOnCloudinary=async(public_id)=>{
    try {
        const result=await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        throw new Error(error)
    }
}

module.exports={uploadImageOnCloudinary,deleteImageOnCloudinary,cloudinary,uploada,deleteVideoOnCloudinary}