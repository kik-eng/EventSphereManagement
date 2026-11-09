// npm i multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const docTypes = [...imageTypes, 'application/pdf'];

const makeUploader = (allowed) =>
  multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) =>
      allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error('Invalid file type.')),
  });

const wrap = (handler) => (req, res, next) =>
  handler(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

exports.uploadLogo = wrap(makeUploader(imageTypes).single('logo'));
exports.uploadDocuments = wrap(makeUploader(docTypes).array('documents', 5));