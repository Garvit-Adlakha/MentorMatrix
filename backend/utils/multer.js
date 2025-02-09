import multer from "multer"
const upload=multer({
    //private files
    dest:"uploads/"
})

export default upload
