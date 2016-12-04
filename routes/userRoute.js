var express = require('express');
var jwt = require("jsonwebtoken");
var User = require('../models/user');
var router = express.Router();


router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// ======= Create endpoint /api/user for POSTS ============= //
router.post('/user', function(req, res) {
    User.findOne({ username: req.body.username, password: req.body.password }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.username = req.body.username;
                userModel.password = req.body.password;
                userModel.admin = req.body.admin;
                userModel.firstName = req.body.firstName;
                userModel.lastName = req.body.lastName;
                userModel.email = req.body.email;
                userModel.save(function(err, user) {
                    user.token = jwt.sign(user, process.env.JWT_SECRET);
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    })
});

router.get('/users', function(req, res) {
    User.find({}, function(err, user) {
        res.send(user);
    });
});

router.post('/login', function(req, res) {
    var name = req.body.username;
    var pass = req.body.password;
    var badLoginMessage = 'Usuario y/o Contraseña erroneos';
    User.findOne({ username: name }, function(err, user) {
        if (err) {
            console.log(name, "Error occured: " + err);
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                console.log('usuario', user);
                user.comparePassword(pass, function(err, isMatch) {
                    if (err) {
                        res.json({
                            type: false,
                            data: badLoginMessage
                        });
                        return;
                    }
                    console.log('isMatch with password', pass, isMatch);
                    if (!isMatch) {
                        res.json({
                            type: false,
                            data: badLoginMessage
                        });
                    } else {
                        res.json({
                            type: true,
                            data: user,
                            token: user.token
                        });
                    }

                });
            } else {
                res.json({
                    type: false,
                    data: badLoginMessage
                });
            }
        }
    });
});

router.get('/me', ensureAuthorized, function(req, res) {
    User.findOne({ token: req.token }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

// ========= DELETE User BY Username ==================== //
router.delete('/user/delete', function(req, res) {
    var name = req.body.username;
    //   console.log("The request is: " + JSON.stringify(req));
    console.log("Attempting to delete user with name: " + name);
    User.find({ username: name }).remove().exec();

    res.json({ message: 'User deleted successfully!', data: User });
});

module.exports = router;
