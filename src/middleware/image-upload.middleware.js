const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadImage = (imageType) => {
  const uploadDir = path.join(__dirname, '../../public', imageType);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, name + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('only images are allowed'));
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
  });
};

module.exports = uploadImage;
