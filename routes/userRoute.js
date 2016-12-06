var express = require('express');
var jwt = require("jsonwebtoken");
var User = require('../models/user');
var router = express.Router();
var JWT_SECRET = 'asdAWweadSd234';


router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// ======= Create endpoint /api/user for POSTS ============= //
router.post('/user', function(req, res) {
    console.log('req', req.body);
    User.findOne({ username: req.body.username }, function(err, user) {
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
                userModel.token = jwt.sign(userModel, JWT_SECRET);
                userModel.save(function(err, user) {
                    console.log('token', user.token);
                    if (err) {
                        res.json({
                            type: false,
                            data: "Error occured: " + err
                        });
                    } else {
                        res.json({
                            type: true,
                            data: user,
                        });
                    }
                });
            }
        }
    })
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

    User.findOne({ username: id }, function(err, user) {
        if (err) {
            return next(err);
        }

        if (firstName !== undefined && firstName.length > 0) user.firstName = firstName;
        if (lastName !== undefined && lastName.length > 0) user.lastName = lastName;
        if (email !== undefined && email.length > 0) user.email = email;
        if (admin !== undefined) user.admin = admin;

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
