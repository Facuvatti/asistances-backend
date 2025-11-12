import {Table, addAuth} from "../models.js"
import database from "../connection.js";
import dotenv from "dotenv"
dotenv.config()
import express from "express";
const router = express.Router();
const db = await database.connect();
const Courses = new Table(db, "courses");
router.use(addAuth({Courses}));
router.get("/courses/years", async (req, res) => {
    let years = await req.tables.Courses.listDistinct("year");
    res.status(200).set(headers).json(years);
});

router.get("/courses/divisions", async (req, res) => {
    let divisions = await req.tables.Courses.listDistinct("division");
    res.status(200).set(headers).json(divisions);
});

router.get("/courses/specialties", async (req, res) => {
    let specialties = await req.tables.Courses.listDistinct("specialty");
    res.status(200).set(headers).json(specialties);
});

router.get("/courses/:year/:division/:specialty", async (req, res) => {
    const { year, division, specialty } = req.params;
    console.log(year, division, specialty);
    let classId = await req.tables.Courses.getId(year, division, specialty);
    res.status(200).set(headers).json([{ id: classId }]);
});

router.get("/courses", async (req, res) => {
    let courses = await req.tables.Courses.list();
    console.log(courses);
    res.status(200).set(headers).json(courses);
});

router.delete("/courses/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.Courses.remove(id);
    res.status(200).set(headers).json({ message: "Curso eliminado" });
});
export default router;