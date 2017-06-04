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

  // MongoClient.connect('mongodb://test:test@ds161551.mlab.com:61551/gamesforgifts', function (err, db) {
  //   if (err) {
  //     return console.error('Connection Error. @mongodb');
  //   }
  //   try {
  //     db.collection('games').insert(req.body);
  //   } catch (err) {
  //     console.error('Error Inserting. @mongodb');
  //     return res.send('lol u wat m8');
  //   }
  //   db.close();
  // });

  res.json(req.files.map(file => {
    let ext = path.extname(file.originalname);
    return {
      originalName: file.originalname,
      filename: file.filename
    }
  }));

});



router.get('/game/:id', (req, res) => {
  MongoClient.connect('mongodb://test:test@ds161551.mlab.com:61551/gamesforgifts', function (err, db) {
			if (err) {
				return console.error('Connection Error. @mongodb');
			}
			db.collection('games').findOne({id: req.params.id}, function (err, obj) {
        if (err) return console.error('We fucked up big time');
        if (obj) {
          console.log(obj.id);
          db.close();
          return res.send(obj.id); // Send back the fucking entire object ya clown
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
