const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
const imageDir = path.join(uploadDir, 'images');
const documentDir = path.join(uploadDir, 'documents');

[uploadDir, imageDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imageDir);
    } else {
      cb(null, documentDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files per request
  }
});

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No File Provided',
        message: 'Please select a file to upload'
      });
    }
    
    let processedFile = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      uploadedBy: req.user.id
    };
    
    // Process image files
    if (req.file.mimetype.startsWith('image/')) {
      try {
        // Create thumbnail for images
        const thumbnailPath = path.join(
          path.dirname(req.file.path),
          `thumb_${req.file.filename}`
        );
        
        await sharp(req.file.path)
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        // Get image metadata
        const metadata = await sharp(req.file.path).metadata();
        
        processedFile.thumbnail = thumbnailPath;
        processedFile.dimensions = {
          width: metadata.width,
          height: metadata.height
        };
        processedFile.format = metadata.format;
        
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Continue without thumbnail if processing fails
      }
    }
    
    // Generate public URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    processedFile.url = `${baseUrl}/uploads/${req.file.mimetype.startsWith('image/') ? 'images' : 'documents'}/${req.file.filename}`;
    
    if (processedFile.thumbnail) {
      processedFile.thumbnailUrl = `${baseUrl}/uploads/images/thumb_${req.file.filename}`;
    }
    
    res.status(201).json({
      message: 'File uploaded successfully',
      data: processedFile
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Upload Failed',
      message: 'Unable to upload file'
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No Files Provided',
        message: 'Please select files to upload'
      });
    }
    
    const processedFiles = [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    for (const file of req.files) {
      let processedFile = {
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: req.user.id
      };
      
      // Process image files
      if (file.mimetype.startsWith('image/')) {
        try {
          // Create thumbnail
          const thumbnailPath = path.join(
            path.dirname(file.path),
            `thumb_${file.filename}`
          );
          
          await sharp(file.path)
            .resize(300, 300, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
          
          // Get metadata
          const metadata = await sharp(file.path).metadata();
          
          processedFile.thumbnail = thumbnailPath;
          processedFile.dimensions = {
            width: metadata.width,
            height: metadata.height
          };
          processedFile.format = metadata.format;
          processedFile.thumbnailUrl = `${baseUrl}/uploads/images/thumb_${file.filename}`;
          
        } catch (imageError) {
          console.error('Image processing error:', imageError);
        }
      }
      
      // Generate public URL
      processedFile.url = `${baseUrl}/uploads/${file.mimetype.startsWith('image/') ? 'images' : 'documents'}/${file.filename}`;
      
      processedFiles.push(processedFile);
    }
    
    res.status(201).json({
      message: 'Files uploaded successfully',
      data: processedFiles,
      count: processedFiles.length
    });
    
  } catch (error) {
    console.error('Multiple file upload error:', error);
    
    // Clean up uploaded files if processing failed
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      error: 'Upload Failed',
      message: 'Unable to upload files'
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Check both image and document directories
    const imagePath = path.join(imageDir, filename);
    const documentPath = path.join(documentDir, filename);
    const thumbnailPath = path.join(imageDir, `thumb_${filename}`);
    
    let fileDeleted = false;
    
    // Delete main file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      fileDeleted = true;
    } else if (fs.existsSync(documentPath)) {
      fs.unlinkSync(documentPath);
      fileDeleted = true;
    }
    
    // Delete thumbnail if exists
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    
    if (!fileDeleted) {
      return res.status(404).json({
        error: 'File Not Found',
        message: 'The specified file does not exist'
      });
    }
    
    res.json({
      message: 'File deleted successfully',
      filename
    });
    
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      error: 'Deletion Failed',
      message: 'Unable to delete file'
    });
  }
});

// @route   GET /api/upload/info/:filename
// @desc    Get file information
// @access  Private
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Check both directories
    const imagePath = path.join(imageDir, filename);
    const documentPath = path.join(documentDir, filename);
    const thumbnailPath = path.join(imageDir, `thumb_${filename}`);
    
    let filePath;
    let fileType;
    
    if (fs.existsSync(imagePath)) {
      filePath = imagePath;
      fileType = 'image';
    } else if (fs.existsSync(documentPath)) {
      filePath = documentPath;
      fileType = 'document';
    } else {
      return res.status(404).json({
        error: 'File Not Found',
        message: 'The specified file does not exist'
      });
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    let fileInfo = {
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      type: fileType,
      url: `${baseUrl}/uploads/${fileType === 'image' ? 'images' : 'documents'}/${filename}`
    };
    
    // Add image-specific info
    if (fileType === 'image') {
      try {
        const metadata = await sharp(filePath).metadata();
        fileInfo.dimensions = {
          width: metadata.width,
          height: metadata.height
        };
        fileInfo.format = metadata.format;
        
        if (fs.existsSync(thumbnailPath)) {
          fileInfo.thumbnailUrl = `${baseUrl}/uploads/images/thumb_${filename}`;
        }
      } catch (imageError) {
        console.error('Image metadata error:', imageError);
      }
    }
    
    res.json({
      message: 'File information retrieved successfully',
      data: fileInfo
    });
    
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      error: 'Info Retrieval Failed',
      message: 'Unable to retrieve file information'
    });
  }
});

// @route   POST /api/upload/resize
// @desc    Resize image file
// @access  Private
router.post('/resize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No Image Provided',
        message: 'Please select an image to resize'
      });
    }
    
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: 'Invalid File Type',
        message: 'Only image files can be resized'
      });
    }
    
    const { width, height, quality = 80 } = req.body;
    
    if (!width && !height) {
      return res.status(400).json({
        error: 'Dimensions Required',
        message: 'Please provide width and/or height for resizing'
      });
    }
    
    const resizedFilename = `resized_${Date.now()}_${req.file.filename}`;
    const resizedPath = path.join(imageDir, resizedFilename);
    
    let resizeOptions = {
      fit: 'inside',
      withoutEnlargement: true
    };
    
    if (width) resizeOptions.width = parseInt(width);
    if (height) resizeOptions.height = parseInt(height);
    
    await sharp(req.file.path)
      .resize(resizeOptions)
      .jpeg({ quality: parseInt(quality) })
      .toFile(resizedPath);
    
    // Get resized image info
    const metadata = await sharp(resizedPath).metadata();
    const stats = fs.statSync(resizedPath);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const resizedFile = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: resizedFilename,
      path: resizedPath,
      mimetype: req.file.mimetype,
      size: stats.size,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      format: metadata.format,
      url: `${baseUrl}/uploads/images/${resizedFilename}`,
      uploadedAt: new Date(),
      uploadedBy: req.user.id,
      resizedFrom: req.file.filename
    };
    
    // Clean up original uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(201).json({
      message: 'Image resized successfully',
      data: resizedFile
    });
    
  } catch (error) {
    console.error('Image resize error:', error);
    
    // Clean up files if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Resize Failed',
      message: 'Unable to resize image'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File Too Large',
        message: 'File size exceeds the allowed limit'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: 'Too Many Files',
        message: 'Number of files exceeds the allowed limit'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected File',
        message: 'Unexpected file field name'
      });
    }
  }
  
  if (error.message.includes('File type') && error.message.includes('not allowed')) {
    return res.status(400).json({
      error: 'Invalid File Type',
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;
