const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  classId: { 
    type: Schema.Types.ObjectId, 
    ref: "Class", 
    required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["PRESENT", "ABSENT"], required: true },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
