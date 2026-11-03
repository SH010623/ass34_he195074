const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const subjectSchema = new Schema({
    code: {
        type: String,
    },
    name: {
        type: String,
    },
    credits: {
        type: Number,
    },
    status: {
        type: String,
        //enum: ["ACTIVE", "INACTIVE"],
    },    
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;