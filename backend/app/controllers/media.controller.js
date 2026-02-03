import { cloudinary } from "../utils/cloudinary.js";

export const uploadMedia = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'nex-l-courses',
            resource_type: 'auto',
        },
        (error, result) => {
            if (error) {
                console.error("Cloudinary SDK Upload Error:", error);
                return res.status(500).json({
                    message: "Cloudinary Upload Failed",
                    error: error
                });
            }
            res.json({
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
            });
        }
    );

    uploadStream.end(req.file.buffer);
};
