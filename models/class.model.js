const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const classSchema = new Schema({
    className: {
        type: String,
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
    },
    lecturerName: {
        type: String,
    },
    status: {
        type: String,
    },
    enrollments: [
        {
            studentId: {
                type: Schema.Types.ObjectId,
                ref: "Student",
            },
            status: {
                type: String,
            },
        },
    ],

});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;