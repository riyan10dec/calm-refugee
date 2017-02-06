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

api.put('/createevent', function (req, res) {
    if (req.body.title
        && req.body.description
        && req.body.userid
        && req.body.eventDate
        && req.body.subcategory
        && req.body.image
        && req.body.seat
    ) {
        var event = new Event({
            "title": req.body.title,
            "description": req.body.description,
            "longitude": req.body.longitude,
            "latitude": req.body.latitude,
            "seen": 1.0,
            "shared": 0.0,
            "loved": 0.0,
            "createdDate": new Date(),
            "createdBy": req.body.userid,
            "eventDate": req.body.eventDate,
            "subcategories": req.body.subcategory,
            "interestUser": [],
            "imagePath": req.body.image,
            "seat": req.body.seat,
            "features": req.body.features === undefined ? [] : req.body.features,
            "barcode": mongoose.Types.ObjectId(),
            "maybe": []
        });
        event.save(function (err) {
            if (err) throw err;
            else {
                res.send({ success: true });
            }
        });
    }
    else {
        res.send({
            success: false,
            message: "One or more parameters required"
        });
    }
});

module.exports = api;  