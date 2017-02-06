var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SubcategoriesSchema = new Schema();
SubcategoriesSchema.add({
    subcategoryID: {
        type: String,
        required: true,
        index: true
    },
    subcategoryName: String,
    hashtag: String
});
var CategoriesSchema = new Schema({
    categoryName: {
        type: String,
        required: true,
        index: true
    },
    subcategories: [SubcategoriesSchema]
});
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Categories', CategoriesSchema, 'Categories');