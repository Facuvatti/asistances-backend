import {Table, Student, addTables} from "../models.js";
import express from "express";
import database from "../connection.js";
const router = express.Router();
const db = await database.connect();
router.use(addTables({course: new Table(db,"courses"), student:new Student(db,"students")}));

router.post("/students", async (req, res) => {
    let { year, division, specialty, students } = req.body;
    students = students.split("\n");
    let courseId = await req.tables.course.create({year, division, specialty});
    console.log("ID del curso: ", courseId);
    let { inserts, errors } = await req.tables.student.createMultiple(students, courseId);
    console.log(inserts,errors);
    if(!errors)res.status(201).json({ message: "Todos los estudiantes insertados correctamente", inserts });
    else res.status(400).json({ message: "Hubo estudiantes no insertados", ...errors });
});

router.post("/student", async (req, res) => {
    let { lastname, name, courseId } = req.body;
    let id = await req.tables.student.create({ lastname, name, courseId });
    res.status(201).json([{ id }]);
});

router.get("/students/:courseId", async (req, res) => {
    const { courseId } = req.params;
    let students = await req.tables.student.listByCourse(courseId);
    res.status(200).json(students);
});

router.delete("/students/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.student.remove(id);
    res.status(200).json({ message: "Estudiante eliminado" });
});

export default router;