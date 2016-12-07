var express = require('express');
var moment = require('moment');
var ContainersHistory = require('../models/containersHistory');
var router = express.Router();


router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});


router.post('/history', function(req, res) {
    var fromDate = moment(req.body.fromDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
    //var fromDate = moment(req.body.fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    var toDate = moment(req.body.toDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
    //var toDate = moment(req.body.toDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    console.log('from', fromDate);
    console.log('to', toDate);
    ContainersHistory.aggregate([{
        $match: { date: { $gt: new Date(fromDate), $lt: new Date(toDate) } }
    }, {
        $group: {
            _id: "$containerId",
            "count": { $sum: 1 }
        }
    }], function(err, result) {
        if (err) {
            console.log(err)
            next(err);
        } else {
            res.json(result);
        }
    });
});

router.post('/fake', function(req, res) {
    var history = new ContainersHistory();
    history.containerId = req.body.containerId;
    history.date = req.body.date;

    history.save(function(err, newHistory) {
        if (err) {
            return next(err);
        }
        res.json(newHistory);
    });

});

router.get('/history', function(req, res) {
    ContainersHistory.find({} , function(err, histories) {
        res.send(histories);
    });
});
module.exports = router;
