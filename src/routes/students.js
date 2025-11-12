import {Table, Student, addAuth} from "../models.js";
import express from "express";
import database from "../connection.js";
import dotenv from "dotenv"
dotenv.config()
const router = express.Router();
const db = await database.connect();
router.use(addAuth({classroom: new Table(db,"classroom"), student:new Student(db,"student")}));

router.post("/students", async (req, res) => {
    let { year, division, specialty, students } = req.body;
    students = students.split("\n");
    let classID = await req.tables.classroom.getId(year, division, specialty);
    let { inserts, errors } = await req.tables.student.createMultiple(students, classID);
    if(!errors)res.status(201).set(headers).json({ message: "Todos los estudiantes insertados correctamente", inserts });
    else res.status(400).set(headers).json({ message: "Hubo estudiantes no insertados", errors });
});

router.post("/student", async (req, res) => {
    let { lastname, name, classId } = req.body;
    let id = await req.tables.student.create({ lastname, name, classId });
    res.status(201).set(headers).json([{ id }]);
});

router.get("/students/:classId", async (req, res) => {
    const { classId } = req.params;
    let students = await req.tables.student.listByClassroom(classId);
    res.status(200).set(headers).json(students);
});

router.delete("/students/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.student.remove(id);
    res.status(200).set(headers).json({ message: "Estudiante eliminado" });
});

export default router;