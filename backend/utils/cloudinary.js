import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config({})

cloudinary.config({
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
})

export const uploadMedia =async(file)=>{
    try {
        const uploadResponse=await cloudinary.uploader.upload(file,{ resource_type:auto})
        return uploadResponse
    } catch (error) {
        console.log("Error in :: uploadMedia()",error)
    }
}

export const  deleteMediaFromCloudinary =async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log("Error in :: deleteMediaFromCloudinary()",error)
    }
}
export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"});
    } catch (error) {
        console.log("Error in :: deleteVideoFromCloudinary()",error);
        
    }
}
