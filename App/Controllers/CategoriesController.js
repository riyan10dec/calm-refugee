var express = require('express');
var Categories = require('../Models/Category');
var User = require('../Models/User');
var api = express.Router();
api.get('/getcategories', function (req, res) {
    Categories.find({}, function (err, categories) {
        if (err) throw err;
        else
            res.json(categories);
    });
});
api.put('/addcategory/:id', function (req, res) {
    User.findOneAndUpdate({ id: req.params.id },
        {
            "$set":
            {
                "interest": req.body.interest
            }
        }, function (err, count) {
            if (err) throw err;
            else {
                res.json({
                    success: true,
                    message: 'Success updating ' + count + 'row(s)'
                });
            }
        });
    //User.findOne({ id: req.params.id }, function (err, user) {
    //    try {
    //        user = JSON.parse(req.params.subcategory);
    //        user.save(function (err, count) {
    //            if (err) throw err;
    //            else
    //                res.json({
    //                    success: true,
    //                    message: 'Success updating ' + count + 'row(s)'
    //                });
    //        });
    //    } catch (e) {
    //        res.json({
    //            success: false,
    //            message: e.message
    //        });
    //    }
    //});
});
module.exports = api;  