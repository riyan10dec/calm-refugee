// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('../Models/User');
var EventsSchema = new Schema();
EventsSchema.add({
    _id: [{type: Schema.Types.ObjectId, ref: 'Events' }]
});
var EditorsPicksSchema = new Schema({
    name: String,
    periodStart: Date,
    periodEnd : Date, 
    events: [{type: Schema.Types.ObjectId, ref: 'Events' }]
});
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('EditorPicks', EditorsPicksSchema, 'EditorPicks');