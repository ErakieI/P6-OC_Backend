const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname
      .split(" ")
      .join("_")
      .replace(/\.[^/.]+$/, "");
    const extension = MIME_TYPES[file.mimetype];
    if (!extension) {
      return callback(new Error("Type de fichier non pris en charge"));
    }
    callback(null, name + Date.now() + "." + extension);
  },
});
const fileFilter = (req, file, callback) => {
  const isValidMimeType = MIME_TYPES[file.mimetype];
  if (isValidMimeType) {
    callback(null, true);
  } else {
    callback(new Error("Type de fichier non pris en charge"));
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  "image"
);

// Redimensionnement de l'image
const resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const filePath = req.file.path;
  const fileName = req.file.filename;
  const resizedFileName = `resized_${fileName}`;
  const outputFilePath = path.join("images", resizedFileName);

  sharp(filePath)
    .metadata()
    .then((metadata) => {
      if (metadata.width < 600 || metadata.height < 600) {
        console.warn("Image trop petite pour redimensionnement");
        req.file.path = filePath;
        req.file.filename = fileName;
        return next();
      }
      return sharp(filePath)
        .resize({ width: 600, height: 600 })
        .toFile(outputFilePath)
        .then(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Erreur de suppression de l'image :", err);
              return next(err);
            }
            req.file.path = outputFilePath;
            req.file.filename = resizedFileName;
            next();
          });
        });
    })
    .catch((err) => {
      console.error("Erreur pendant la modification de l'image :", err);
      return next(err);
    });
};

module.exports = { upload, resizeImage };
