import {Table, addTables} from "../models.js"
import database from "../connection.js";
import express from "express";
const router = express.Router();
const db = await database.connect();
router.use(addTables({Courses: new Table(db, "courses")}));

router.post("/courses", async (req, res) => {
    let { year, division, specialty } = req.body;
    let courseId = await req.tables.Courses.create({year, division, specialty});
    res.status(200).json({ message: "Curso creado exitosamente", course: courseId });
});

router.get("/courses/:year/:division/:specialty", async (req, res) => {
    const { year, division, specialty } = req.params;
    console.log(year, division, specialty);
    let classId = await req.tables.Courses.getId(year, division, specialty);
    res.status(200).json([{ id: classId }]);
});

router.get("/courses", async (req, res) => {
    let courses = await req.tables.Courses.list();
    res.status(200).json({courses: courses});
});

router.delete("/courses/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.Courses.remove(id);
    res.status(200).json({ message: "Curso eliminado" });
});
export default router;