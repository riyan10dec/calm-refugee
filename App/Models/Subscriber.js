// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
Schema = mongoose.Schema;

mongoose.models = {};
mongoose.modelSchemas = {};
var Schema = mongoose.Schema;

var SubscriberSchema = new Schema();
SubscriberSchema.add({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    email: String,
    subscribeDate: Date

});
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Subscribers', SubscriberSchema, 'Subscribers');