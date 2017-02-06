var mongoose = require('mongoose');
var express = require('express');
var _ = require('underscore');
var Categories = require('../Models/Category');
var User = require('../Models/User');
var Event = require('../Models/Event');
var categoryEventList = [];
var userSubcategory = [];
var categoryEvent = [];
var EventsGlobals = [];
var api = express.Router();

api.get('/loadprofile/self/:userid', function (req, res) {
    User.findOne({ id: req.params.userid })
        .exec(function (err, user) {
            res.send({
                'user': user,
                'followingCount': user.following === undefined ? 0 : user.following.length,
                'followedCount': user.followed === undefined ? 0 : user.followed.length
            });
        });
});
api.get('/loadprofile/other/:userid/:otheruserid', function (req, res) {
    User.findOne({ id: req.params.otheruserid })
        .lean()
        .exec(function (err, user) {
            var hasFollowed = false;
            _.forEach(user.followed, function (followeduser) {
                if (followeduser.id == req.params.userid)
                    hasFollowed = true;
            });
            res.send({
                'user': user,
                'followingCount': user.following === undefined ? 0 : user.following.length,
                'followedCount': user.followed === undefined ? 0 : user.followed.length,
                'hasFollowed': hasFollowed
            });
        });
});
api.put('/follow/:userid/:otheruserid', function (req, res) {
    User.update(
        { id: req.params.userid },
        {
            $addToSet: {
                "following": {
                    "id": req.params.otheruserid
                }
            }
        })
        .exec(function (err, data) {
            if (err) throw err;
            else {
                User.update(
                    { id: req.params.otheruserid },
                    {
                        $addToSet: {
                            "followed": {
                                "id": req.params.userid
                            }
                        }
                    },
                    {
                        upsert: true
                    })
                    .exec(function (err, data) {
                        if (err) throw err;
                        else {
                            res.send({ success: true });
                        }
                    });
            }
        });
});
api.put('/unfollow/:userid/:otheruserid', function (req, res) {
    User.update(
        { id: req.params.userid },
        {
            $pull: {
                "following": {
                    "id": req.params.otheruserid
                }
            }
        }
    )
        .exec(function (err, data) {
            if (err) throw err;
            else {
                User.update(
                    { id: req.params.otheruserid },
                    {
                        $pull: {
                            "followed": {
                                "id": req.params.userid
                            }
                        }
                    }
                )
                    .exec(function (err, data) {
                        if (err) throw err;
                        else {
                            res.send({ success: true });
                        }
                    });
            }
        });
});
api.put('/updateprofile', function (req, res) {
    User.update(
        { id: req.body.userid },
        {
            $set: {
                name: req.body.newname,
                description: req.body.description,
                interest: req.body.interest
            }
        })
        .exec(function (err, data) {
            if (err) throw err;
            else {
                res.send({ success : true });
            }
        });
});
module.exports = api;  