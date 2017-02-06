var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var maybeSchema = new Schema();

maybeSchema.add({
id : {
        type : String,
        index : true
    }
});
var EventsSchema = new Schema({
    _id : Schema.Types.ObjectId,
    title: String,
    description: String,
    longitude: String,
    latitude: String,
    seen: Number,
    shared: Number,
    loved: Number,
    createdDate: Date,
    createdBy: String,
    eventDate: Date,
    subcategories: 
 {
        subcategoryID: {
            type : String,
            index : true
        },
        subcategoryName: String,
        categoryID: Schema.Types.ObjectId
    },
    interestUser:
 {
        id: {
            type : String,
            index : true
        },
        checkIn : Boolean
    },
    imagePath: String,
    seat: Number,
    features:
 {
        featureID: String,
        featureName: String
    },
    maybe : [maybeSchema],
    barcode : String,
    editorsPickId : {type: Schema.Types.ObjectId, ref: 'EditorPick' },
    eventPlace : String,
    joinedUser : [{type : Schema.Types.ObjectId, ref : 'Users'}]
});
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Events', EventsSchema, 'Events');