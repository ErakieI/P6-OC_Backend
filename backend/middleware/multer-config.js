const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').replace(/\.[^/.]+$/, "");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage: storage }).single('image');

// Redimensionnement de l'image
const resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const resizedFileName = `resized_${fileName}`;
  const outputFilePath = path.join('images', resizedFileName);

  sharp(filePath)
    .metadata()
    .then(metadata => {
      if (metadata.width < 206 || metadata.height < 260) {
        console.warn('Image trop petite pour redimensionnement, en conservant l\'image d\'origine');
        req.file.path = filePath;
        req.file.filename = fileName;
        return next();
      }

      return sharp(filePath)
        .resize({ width: 206, height: 260 })
        .toFile(outputFilePath)
        .then(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Erreur de suppression de l\'image :', err);
              return next(err);
            }
            req.file.path = outputFilePath;
            req.file.filename = resizedFileName;
            next();
          });
        });
    })
    .catch(err => {
      console.error('Erreur pendant la modification de l\'image :', err);
      return next(err);
    });
};

module.exports = { upload, resizeImage };
