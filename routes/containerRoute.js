var express = require('express');
var router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

router.get('/sayhi', function(req, res) {
  res.json({ message: 'All the niggas say hooo-ohhh' });
	console.log("All the niggas say hooo-ohhh");
});

// Create a new route with the prefix /container
//var containerRoute = router.route('/container');

// Create endpoint /api/containers for POSTS
router.post('/container', function(req, res) {
  // Create a new instance of the Beer model
  var cont = new Container();

  // Set the container properties that came from the POST data
  cont.address = req.body.address;
  cont.percentageFull = req.body.percentageFull;

  // Save the container in DB and check for errors
  cont.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Container information added to the database!', data: cont });
  });
});
 

/*
 * GET containerList.
 */
/*
router.get('/containerList', function(req, res) {
    var db = req.db;
    var collection = db.get('containerList');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});*/



module.exports = router;