import multer from 'multer';
import pathUpload from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {

    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Netinkamas failo formatas. Leidžiami tik JPEG, PNG, GIF.'), false);
  }
};

const uploadConfig = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 
  },
  fileFilter: fileFilter
});

export default uploadConfig;
