// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
Schema = mongoose.Schema;

mongoose.models = {};
mongoose.modelSchemas = {};
var Schema = mongoose.Schema;

var TicketSchema = new Schema();
TicketSchema.add({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    eventid: Schema.Types.ObjectId

});
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Tickets', TicketSchema, 'Tickets');