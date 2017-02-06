var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var InterestSchema = new Schema();
InterestSchema.add({
    subcategoryID: {
        type: String,
        required: true,
        index: true
    }
});
var FollowSchema = new Schema();
FollowSchema.add({
    id: {
        type: String,
        required: true
    }
});
var UserSchema = new Schema({
    id: {
        type: String,
        required: true,
        index: true
    },
    password: String,
    email: String,
    phone: String,
    description: String,
    fb: {
        id: String,
        access_token: String,
        firstName: String,
        lastName: String,
        email: String
    },
    gplus: {
        id: String,
        token: String,
        username: String,
        displayName: String,
        lastStatus: String
    },
    forgotPasswordToken: String,
    interest: {
        type: [InterestSchema],
        required: true,
        default: {}
    },
    following: {
        id: {
            type: String,
            required: true,
            unique: true,
            index :true
        }
    },
    followed: {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
        }
    }
});
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Users', UserSchema, 'Users');