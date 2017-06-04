var express = require('express');
var router = express.Router();

var path = require('path');
var multer = require('multer');  // tool to parse data that isnt text

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

router.post('/upload', upload.any(), (req, res) => {

  console.log(req.files);

  res.json(req.files.map(file => {
    let ext = path.extname(file.originalname);
    return {
      originalName: file.originalname,
      filename: file.filename
    }
  }));

});

router.get('/', function (req, res, next) {
    res.render('index');
});

module.exports = router;
