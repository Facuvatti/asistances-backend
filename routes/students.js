import {Table, Student} from "./models.js";
const express = require("express");
const router = express.Router();
const db = process.env.DB
const classroom = new Table(db,"classroom");
const student = new Student(db,"student");
router.post("/students", async (req, res) => {
    classroom.auth = req.user;
    student.auth = req.user;
    let { year, division, specialty, students } = req.body;
    students = students.split("\n");
    let classID = await classroom.getId(year, division, specialty);
    let { inserts, errors } = await student.createMultiple(students, classID);
    if(!errors)res.status(201).set(headers).json({ message: "Todos los estudiantes insertados correctamente", inserts });
    else res.status(400).set(headers).json({ message: "Hubo estudiantes no insertados", errors });
});

router.post("/student", async (req, res) => {
    classroom.auth = req.user;
    student.auth = req.user;
    let { lastname, name, classId } = req.body;
    let id = await student.create({ lastname, name, classId });
    res.status(201).set(headers).json([{ id }]);
});

router.get("/students/:classId", async (req, res) => {
    classroom.auth = req.user;
    student.auth = req.user;
    const { classId } = req.params;
    let students = await student.listByClassroom(classId);
    res.status(200).set(headers).json(students);
});

router.delete("/students/:id", async (req, res) => {
    classroom.auth = req.user;
    student.auth = req.user;
    const { id } = req.params;
    await student.remove(id);
    res.status(200).set(headers).json({ message: "Estudiante eliminado" });
});


module.exports = router;