const path=require('path');
const mongoose = require('mongoose');
const coverImageBasePath='uploads/bookCovers';
const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
        ref: 'Author'
    }
});


bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImageName !=null){
        // console.log(this.coverImageName);
        return path.join('/',coverImageBasePath,this.coverImageName);
    }
});



module.exports = mongoose.model('book', bookSchema);
module.exports.coverImageBasePath=coverImageBasePath;