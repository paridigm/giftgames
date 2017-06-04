var express = require('express');
var router = express.Router();

var path = require('path');
var multer = require('multer');  // tool to parse data that isnt text
var MongoClient = require('mongodb');

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
  var obj = {
    key:  Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6),
    images: []
  };
  obj.images = req.files.map(file => {
    return {
        key: file.key,
        filepath: file.path,
        filename: file.originalname
    }
  });

  MongoClient.connect('mongodb://test:test@ds161551.mlab.com:61551/gamesforgifts', function (err, db) {
    if (err) return console.error('Connection Error. @mongodb');
    try {
      db.collection('games').insert(obj);
    } catch (err) {
      console.error('Error Inserting. @mongodb');
      return res.send('lol u wat m8');
    }
    db.close();
  });

  res.json(req.files.map(file => {
    let ext = path.extname(file.originalname);
    return {
      originalName: file.originalname,
      filename: file.filename
    }
  }));
});



router.get('/game/:key', (req, res) => {
  MongoClient.connect('mongodb://test:test@ds161551.mlab.com:61551/gamesforgifts', function (err, db) {
			if (err) {
				return console.error('Connection Error. @mongodb');
			}
			db.collection('games').findOne({key: req.params.key}, function (err, obj) {
        if (err) return console.error('We fucked up big time');
        if (obj) {
          console.log(obj);
          db.close();
          return res.json(obj); // Send back the fucking entire object ya clown
        }
        db.close();
        return res.send("Wat"); // No game found
      });
		});
});


router.get('/', function (req, res, next) {
    res.render('index');
});

module.exports = router;
