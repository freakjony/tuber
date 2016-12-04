var express = require('express');
var User = require('../models/user');
var router = express.Router();


router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// ======= Create endpoint /api/user for POSTS ============= //
router.post('/user', function(req, res) {
    // Create a new instance of a user
    var user1 = new User();
    // Set the User properties that came from the POST data
    user1.username = req.body.username;
    user1.password = req.body.password;
    user1.admin = req.body.admin;
    user1.firstName = req.body.firstName;
    user1.lastName = req.body.lastName;
    user1.email = req.body.email;

    //Save the user in DB and check for errors
    user1.save(function(err) {
        if (err) {
            console.log('400', err);
            res.status(400).send(err);
            return;
        }
        user1.password = '';
        res.json({ message: 'User information added to the database!', user: user1 });
    });
});

router.get('/users', function(req, res) {
    User.find({}, function(err, user) {
        res.send(user);
    });
});

router.get('/user', function(req, res) {
    var id = req.query.username;

    User.findOne({ username: id }, function(err, user) {
        if (err) {
            return next(err);
        }
        res.send(user);
    });
});

router.put('/user', function(req, res) {    
    var id = req.body.username;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var admin = req.body.admin;

    console.log(id + firstName + lastName + email + admin);
    User.findOne({ username: id }, function(err, user) {
        if (err) {
            return next(err);
        }

        if (firstName !== undefined && firstName.length > 0)  user.firstName = firstName;
        if (lastName !== undefined && lastName.length > 0 ) user.lastName = lastName;
        if (email !== undefined && email.length > 0 ) user.email = email;
        if (admin !== undefined) user.admin = admin;
        console.log(admin);
        console.log(user.admin);
        user.save(function(err, updatedUser) {
            if (err) {
                return next(err);
            }
            res.send(updatedUser);
        });
    });
});

router.post('/login', function(req, res) {
    var name = req.body.username;
    var pass = req.body.password;
    var badLoginMessage = 'Usuario y/o Contraseña erroneos';
    User.findOne({ username: name }, function(err, user) {
        if (err) {
            return res.status(401).send(err);
        }
        if(user){
        user.comparePassword(pass, function(err, isMatch) {
            if (err) {
                return res.status(401).send(badLoginMessage);
            }
            console.log('isMatch with password', pass, isMatch);
            if(!isMatch){
                res.status(401).send(badLoginMessage);
            }else{
                user.password = '';
                res.send(user);
            }
            
        });
    } else {
        return res.status(401).send(badLoginMessage);
    }
    });
});

// ========= DELETE User BY Username ==================== //
router.delete('/user/delete', function(req, res) {
    var name = req.body.username;
    //   console.log("The request is: " + JSON.stringify(req));
    console.log("Attempting to delete user with name: " + name);
    User.find({ username: name }).remove().exec();

    res.json({ message: 'User deleted successfully!', data: User });
});

module.exports = router;
