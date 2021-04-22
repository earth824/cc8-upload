require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Product } = require('./models');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// cloudinary.config({
//   cloud_name: 'flyinggiraffe',
//   api_key: '419136161916459',
//   api_secret: '0At5O-SvSlHIvxXzqr5tHOdPaV4'
// });

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file);
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.split('/')[1] === 'jpeg' ||
      file.mimetype.split('/')[1] === 'jpg' ||
      file.mimetype.split('/')[1] === 'png'
    ) {
      cb(null, true);
    } else {
      cb(new Error('this file is not a photo'));
    }
  }
});

app.use(cors());
app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: false })); // x-www-form-urlencoded

app.post('/', upload.single('image'), async (req, res, next) => {
  console.log(req.file);
  cloudinary.uploader.upload(req.file.path, async (err, result) => {
    if (err) return next(err);
    const product = await Product.create({ name: req.body.name, imgUrl: result.secure_url });
    fs.unlinkSync(req.file.path);
    res.status(200).json({ message: 'image uploaded', product });
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'path not found on this server' });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: err.message });
});

// sequelize.sync({ force: true }).then(() => console.log('DB Sync'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server running on port ${port}`));
