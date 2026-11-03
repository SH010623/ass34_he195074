const express = require("express");
const db = require("../models");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const verifyToken = require("../middlewares/verifyToken");
const ApiRouter = express.Router();

ApiRouter.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const { TEST_LOGIN_EMAIL, TEST_LOGIN_PASSWORD, TEST_LOGIN_STUDENT_ID } = process.env;
  if (!TEST_LOGIN_EMAIL || !TEST_LOGIN_PASSWORD || !TEST_LOGIN_STUDENT_ID) {
    return res
      .status(500)
      .json({ message: "Test login account is not configured" });
  }
  if (email !== TEST_LOGIN_EMAIL || password !== TEST_LOGIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  try {
    const token = jwt.sign(
      { studentId: TEST_LOGIN_STUDENT_ID, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Unable to generate token" });
  }
});

ApiRouter.get(
  "/api/classes/:classId/students",
  verifyToken,
  async (req, res) => {
    try {
      const classId = req.params.classId;
      const { status } = req.query;

      if (!mongoose.isObjectIdOrHexString(classId)) {
        return res.status(400).json({ error: `Invalid classId: ${classId}` });
      }

      const classData = await db.Class.findById(classId).populate({
        path: "enrollments.studentId",
      });

      if (!classData) {
        return res
          .status(404)
          .json({ error: `Class with id = ${classId} not found` });
      }

      if (status !== undefined && !["enrolled", "dropped"].includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status}` });
      }

      const students = classData.enrollments
        .filter(
          (enrollment) =>
            enrollment.studentId && (!status || enrollment.status === status),
        )
        .map((enrollment) => enrollment.studentId)
        .map((student) => ({
          _id: student._id,
          studentCode: student.studentCode,
          fullName: student.fullName,
          email: student.email,
        }));

      res.status(200).json(students);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
);

ApiRouter.get(
  "/api/classes/:classId/attendance-summary",
  verifyToken,
  async (req, res) => {
    try {
      const classId = req.params.classId;

      if (!mongoose.isObjectIdOrHexString(classId)) {
        return res.status(400).json({ error: `Invalid classId: ${classId}` });
      }

      const classData = await db.Class.findById(classId).populate({
        path: "enrollments.studentId",
      });

      if (!classData) {
        return res
          .status(404)
          .json({ error: `Class with id = ${classId} not found` });
      }

      const enrolledStudents = classData.enrollments.filter(
        (enrollment) =>
          enrollment.status === "enrolled" && enrollment.studentId,
      );

      const studentIds = enrolledStudents.map(
        (enrollment) => enrollment.studentId._id,
      );

      const attendanceRecords = await db.Attendance.find({
        classId: classId,
        studentId: { $in: studentIds },
      });

      const attendanceByStudent = new Map();

      for (const record of attendanceRecords) {
        const studentIdStr = record.studentId.toString();

        const stast = attendanceByStudent.get(studentIdStr) || {
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
        };

        stast.totalSessions += 1;
        if (record.status === "PRESENT") {
          stast.presentCount += 1;
        } else if (record.status === "ABSENT") {
          stast.absentCount += 1;
        }

        attendanceByStudent.set(studentIdStr, stast);
      }

      const attendanceSummary = enrolledStudents.map((enrollment) => {
        const student = enrollment.studentId;

        const stast = attendanceByStudent.get(student._id.toString()) || {
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
        };

        const attendanceRate =
          stast.totalSessions > 0
            ? Number(
                ((stast.presentCount / stast.totalSessions) * 100).toFixed(1),
              )
            : 0;

        return {
          studentCode: student.studentCode,
          fullName: student.fullName,
          totalSessions: stast.totalSessions,
          present: stast.presentCount,
          absent: stast.absentCount,
          attendanceRate: attendanceRate,
          warning: attendanceRate < 80,
        };
      });

      res.status(200).json(attendanceSummary);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
);

ApiRouter.get(
  "/api/students/:studentId/attendances",
  verifyToken,
  async (req, res) => {
    try {
      const studentId = req.params.studentId;

      if (!mongoose.isObjectIdOrHexString(studentId)) {
        return res
          .status(400)
          .json({ error: `Invalid studentId: ${studentId}` });
      }

      const studentData = await db.Student.findById(studentId);

      if (!studentData) {
        return res
          .status(404)
          .json({ error: `Student with id = ${studentId} not found` });
      }

      const attendanceRecords = await db.Attendance.find({
        studentId: studentId,
      }).populate({
        path: "classId",
        populate: {
          path: "subjectId",
        },
      });

      const attendanceSummary = attendanceRecords.map((record) => ({
        id: record._id,
        className: record.classId?.className ?? null,
        subjectName: record.classId?.subjectId?.name ?? null,
        date: record.date,
        status: record.status,
      }));

      res.status(200).json(attendanceSummary);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
);

module.exports = ApiRouter;
