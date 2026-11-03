const mongoose = require("mongoose");
const Student = require("./student.model");
const Class = require("./class.model");
const Subject = require("./subject.model");
const Attendance = require("./attendance.model");


const db = {}

db.Student = Student;
db.Class = Class;
db.Subject = Subject;
db.Attendance = Attendance;

module.exports = db;