/* BlogAuth V1 services/mediaService.js — Media Service Layer */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { Media } = require('../models');

// Configure Multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Permitted formats: JPG, JPEG, PNG, WEBP, SVG.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Cloudinary if keys exist
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a file buffer, optimizes it, logs in database, and returns metadata
 */
async function uploadImage(file, userId, type = 'general', folder = 'blog_assets') {
  if (!file) throw new Error('No file buffer provided for upload.');

  let url = '';
  let publicId = '';
  let width = null;
  let height = null;
  let format = '';
  let bytes = file.size;
  let thumbnailUrl = '';

  const ext = path.extname(file.originalname).toLowerCase();
  const isSvg = ext === '.svg' || file.mimetype === 'image/svg+xml';

  if (isCloudinaryConfigured) {
    try {
      // Set up transformation configurations based on type
      let transformation = [];
      if (type === 'avatar') {
        transformation = [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }];
      } else if (type === 'cover') {
        transformation = [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }];
      } else if (type === 'inline') {
        transformation = [{ width: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }];
      } else {
        transformation = [{ quality: 'auto', fetch_format: 'auto' }];
      }

      // Stream upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            transformation: transformation,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      url = uploadResult.secure_url;
      publicId = uploadResult.public_id;
      width = uploadResult.width;
      height = uploadResult.height;
      format = uploadResult.format;
      bytes = uploadResult.bytes;

      // Generate thumbnail via Cloudinary transformations
      thumbnailUrl = uploadResult.secure_url.replace('/upload/', '/upload/w_150,c_scale/');
    } catch (error) {
      console.error('Cloudinary stream upload failed, falling back to local:', error);
      return await uploadLocalFallback(file, userId, type, isSvg);
    }
  } else {
    // Local fallback
    return await uploadLocalFallback(file, userId, type, isSvg);
  }

  // Save database record
  const mediaObj = await Media.create({
    url,
    publicId,
    uploader: userId,
    type,
    bytes,
    mimeType: file.mimetype,
    width,
    height,
    format,
    thumbnailUrl
  });

  return mediaObj;
}

/**
 * Handles local fallback saving & optimization using sharp
 */
async function uploadLocalFallback(file, userId, type, isSvg) {
  const uploadPath = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
  
  let filename = '';
  let thumbFilename = '';
  let url = '';
  let localThumbUrl = '';
  let width = null;
  let height = null;
  let format = '';
  let bytes = file.size;

  if (isSvg) {
    // SVGs do not need sharp processing
    filename = `${uniqueId}.svg`;
    const targetPath = path.join(uploadPath, filename);
    fs.writeFileSync(targetPath, file.buffer);

    url = `/uploads/${filename}`;
    thumbnailUrl = url; // SVG acts as its own thumbnail
    format = 'svg';
    publicId = filename;
  } else {
    // Raster image: optimize and save as WebP using sharp
    filename = `${uniqueId}.webp`;
    thumbFilename = `${uniqueId}-thumb.webp`;
    const targetPath = path.join(uploadPath, filename);
    const thumbPath = path.join(uploadPath, thumbFilename);

    let imagePipeline = sharp(file.buffer);
    const metadata = await imagePipeline.metadata();

    // Process main image based on type
    if (type === 'avatar') {
      imagePipeline = imagePipeline.resize(300, 300, { fit: 'cover' });
    } else if (type === 'cover') {
      imagePipeline = imagePipeline.resize(1200, null, { withoutEnlargement: true });
    } else if (type === 'inline') {
      imagePipeline = imagePipeline.resize(1000, null, { withoutEnlargement: true });
    }

    const processedBuffer = await imagePipeline.webp({ quality: 80 }).toBuffer();
    fs.writeFileSync(targetPath, processedBuffer);

    // Generate and save thumbnail
    const thumbBuffer = await sharp(file.buffer)
      .resize(150, 150, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();
    fs.writeFileSync(thumbPath, thumbBuffer);

    // Get final processed dimensions & stats
    const finalMeta = await sharp(processedBuffer).metadata();
    width = finalMeta.width;
    height = finalMeta.height;
    format = 'webp';
    bytes = processedBuffer.length;
    publicId = filename;

    url = `/uploads/${filename}`;
    thumbnailUrl = `/uploads/${thumbFilename}`;
  }

  // Log in database
  const mediaObj = await Media.create({
    url,
    publicId,
    uploader: userId,
    type,
    bytes,
    mimeType: isSvg ? 'image/svg+xml' : 'image/webp',
    width,
    height,
    format,
    thumbnailUrl
  });

  return mediaObj;
}

/**
 * Deletes a media file from Storage and DB
 */
async function deleteImage(mediaId) {
  const media = await Media.findById(mediaId);
  if (!media) return false;

  if (isCloudinaryConfigured && !media.url.startsWith('/uploads')) {
    try {
      await cloudinary.uploader.destroy(media.publicId);
    } catch (error) {
      console.error('Cloudinary destroy error:', error);
    }
  } else {
    // Local delete
    const uploadPath = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadPath, media.publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if it's a separate file
    if (media.thumbnailUrl && media.thumbnailUrl.startsWith('/uploads') && media.thumbnailUrl !== media.url) {
      const thumbFilename = path.basename(media.thumbnailUrl);
      const thumbPath = path.join(uploadPath, thumbFilename);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }
  }

  await Media.deleteOne({ _id: mediaId });
  return true;
}

/**
 * Clean up all media items where isUsed is false and age > 1 hour
 */
async function cleanupUnusedMedia() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const orphanMedia = await Media.find({
    isUsed: false,
    createdAt: { $lt: oneHourAgo }
  });

  let count = 0;
  for (const media of orphanMedia) {
    const success = await deleteImage(media._id);
    if (success) count++;
  }
  return count;
}

module.exports = {
  upload,
  uploadImage,
  deleteImage,
  cleanupUnusedMedia
};
