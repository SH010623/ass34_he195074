const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const studentSchema = new Schema({
    studentCode: {
        type: String,
    },
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
       
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;