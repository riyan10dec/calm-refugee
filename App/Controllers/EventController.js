var mongoose = require('mongoose');
var express = require('express');
var _ = require('underscore');
var Categories = require('../Models/Category');
var User = require('../Models/User');
var Event = require('../Models/Event');
var EditorsPick = require('../Models/EditorsPick');
var categoryEventList = [];
var userSubcategory = [];
var categoryEvent = [];
var EventsGlobals = [];
var api = express.Router();
api.get('/homeevent/:userid', function (req, res) {
    User.findOne({ id: req.params.userid }, function (err, user) {
        if (err) throw err;
        else {
            for (usercat in user.interest)
                if (user.interest[usercat].subcategoryID)
                    userSubcategory.push(user.interest[usercat].subcategoryID);
            //get event match with user subcategory
            Event.find({
                subcategories: {
                    $elemMatch: { subcategoryID: { $in: userSubcategory } }
                },
                eventDate: { $gte: new Date() }
            },
                null,
                {
                    sort: {
                        eventDate: -1
                    },
                    limit: 5
                })
                .lean()
                .exec(function (err, events) {
                    if (err) throw err;
                    else {
                        EventsGlobals = events;
                        var eventscategory = [];
                        events.forEach(function (event) {
                            eventscategory.push(
                                _.uniq(
                                    _.map(
                                        _.where(event.subcategories),
                                        function (sub) {
                                            return sub.categoryID;
                                        })
                                )
                            );
                        });
                        //remove duplicate
                        eventscategory = eventscategory.filter(function (elem, pos) {
                            return eventscategory.indexOf(elem) == pos;
                        });
                        eventscategory = _.flatten(eventscategory);
                        //get categories name based on user subcategory
                        Categories.find({
                            _id: { $in: eventscategory }
                        })
                            .lean()
                            .exec(function (err, categories) {
                                if (err) throw err;
                                else {
                                    categories.forEach(function (category) {
                                        var eventsgrouping = _.filter(EventsGlobals, function (event) {
                                            return _.filter(event.subcategories, function (subcategory) {
                                                return subcategory.categoryID == category._id
                                            });
                                        });

                                        categoryEvent.push({
                                            'categoryName': category.categoryname,
                                            'event': eventsgrouping
                                        });
                                    });
                                    res.send(categoryEvent);
                                }
                            })
                    }
                });
        }
    });
});
api.get('/loadEventCategory/:categoryID/:reloadCount/:userid', function (req, res) {
    User.findOne({ id: req.params.userid }, function (err, user) {
        if (err) throw err;
        else {
            for (usercat in user.interest)
                if (user.interest[usercat].subcategoryID)
                    userSubcategory.push(user.interest[usercat].subcategoryID);
            //get event match with user subcategory
            Event.find({
                subcategories: {
                    $elemMatch: {
                        subcategoryID: { $in: userSubcategory },
                        categoryID: mongoose.Types.ObjectId(req.params.categoryID)
                    }
                },
                eventDate: { $gte: new Date() }
            },
                null,
                {
                    skip: req.params.reloadCount * 5,
                    sort: {
                        eventDate: -1
                    },
                    limit: 5
                })
                .lean()
                .exec(function (err, events) {
                    if (err) throw err;
                    else {
                        res.send(events);
                    }
                });
        }
    });
});
api.get('/editorspick', function (req, res) {
    EditorsPick.find({
        periodStart: { $lte: new Date() },
        periodEnd: { $gte: new Date() }
    })
        .lean()
        .populate({
            path: 'events',
            populate: {
                path: 'joinedUser',
                model: 'Users'
            },
            options: {
                sort: {
                    eventDate: -1
                }
            }
        })
        .exec(function (err, editorspick) {
            if (err) throw err;
            else {
                res.send(editorspick);
            }
        });
});
api.get('/editorspick/:editorspickid/:currentPage', function (req, res) {
    var itemPerPage = 2;
    EditorsPick.find({
        periodStart: { $lte: new Date() },
        periodEnd: { $gte: new Date() },
        _id: req.params.editorspickid
    })
        .populate({
            path: 'events',
            options: {
                sort: {
                    eventDate: -1
                },
                limit: itemPerPage,
                skip: (req.params.currentPage) * itemPerPage
            },
            populate: {
                path: 'joinedUser',
                model: 'Users'
            }
        })
        .exec(function (err, editorspick) {
            if (err) throw err;
            else {
                res.send(editorspick);
            }
        });
});
api.put('/eventdetail/:eventid/:userid', function (req, res) {
    Event.update({ _id: req.params.eventid },
        { $inc: { seen: 1 } })
        .exec(function (err, data) {
            if (err) throw err;
            else {
                Event.findOne({ _id: req.params.eventid }, function (err, event) {
                    if (err) throw err;
                    else {
                        if (event) {
                            var eventJSON = event.toJSON();
                            var interestJSON = eventJSON.interestUser;
                            var maybeJSON = eventJSON.maybe;
                            var countLove = eventJSON.loved;
                            var countShared = eventJSON.shared;
                            var isInterest = false;
                            var isMaybe = false;
                            if (contains(interestJSON, "id", req.params.userid)) {
                                isInterest = true;
                            }
                            if (contains(maybeJSON, "id", req.params.userid)) {
                                isMaybe = true;
                            }
                            res.send({
                                success: true,
                                data: {
                                    isInterest: isInterest,
                                    isMaybe: isMaybe,
                                    countLove: countLove,
                                    countShared: countShared
                                }
                            });
                        }
                        else {
                            res.send({
                                success: false
                            });
                        }
                    }
                });
            }
        });
});
api.put('/share/:userid/:eventid', function (req, res) {
    Event.update({ _id: req.params.eventid },
        { $inc: { shared: 1 } }
    ).exec(function (err, data) {
        if (err) throw err;
        else
            res.send({ success: true });
    });
});
api.put('/interest/:userid/:eventid', function (req, res) {
    Event.findByIdAndUpdate(req.params.eventid,
        {
            $push: {
                "interestUser": {
                    "id": req.params.userid,
                    "checkIn": false
                }
            }
        },
        {
            safe: true, upsert: true, new: true
        }).exec(function (err, event) {
            if (err) throw err;
            else {
                res.send({ success: true });
            }
        });
});
api.delete('/uninterest/:userid/:eventid', function (req, res) {
    Event.update({ _id: req.params.eventid },
        {
            $pull: {
                interestUser: {
                    id: req.params.userid
                }
            }
        })
        .exec(function (err, event) {
            if (err) throw err;
            else {
                res.send({ success: true });
            }
        });
});
api.put('/maybe/:userid/:eventid', function (req, res) {
    Event.findByIdAndUpdate(req.params.eventid,
        {
            $push: {
                "maybe": { "id": req.params.userid }
            }
        },
        {
            safe: true, upsert: true, new: true
        }).exec(function (err, event) {
            if (err) throw err;
            else {
                res.send({ success: true });
            }
        });
});
api.delete('/unmaybe/:userid/:eventid', function (req, res) {
    Event.update({ _id: req.params.eventid },
        {
            $pull: {
                maybe: {
                    id: req.params.userid
                }
            }
        })
        .exec(function (err, event) {
            if (err) throw err;
            else {
                res.send({ success: true });
            }
        });
});
api.get('/featured/:reloadCount', function (req, res) {
    Event.find({},
        {
            skip: req.params.reloadCount * 10 + 1,
            limit: 10, // Ending Row
            sort: {
                seen: -1
            }
        })
        .exec(function (err, events) {
            if (err) throw err;
            else {
                res.send(events);
            }
        });
});
function isEventHasPushed(array, prop) {
    var found = false;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == prop) {
            found = true;
            break;
        }
    }
    return found;
}
function contains(array, prop, value) {
    //if (array[prop] == value) {
    //    return true;
    //}
    //else
    //    return false;
    for (var i = 0; i < array.length; i++) {
        if (array[i][prop] == value) {
            return true;
        }
    }
    return false;
}
module.exports = api;