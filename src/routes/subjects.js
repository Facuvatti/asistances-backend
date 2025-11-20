import {Table, addTables} from "../models.js"
import database from "../connection.js";
import express from "express";
const router = express.Router();
const db = await database.connect();
router.use(addTables({subjects: new Table(db, "subjects")}));

router.get("/subjects", async (req, res) => {
    let subjects = await req.tables.subjects.list();
    res.status(200).json({subjects: subjects});
});
router.post("/subjects", async (req, res) => {
    let { course, subject, teacher, hours } = req.body;
    let subjectId = await req.tables.subjects.create({course, name:subject, teacher, hours});
    res.status(200).json({ message: "Materia creada exitosamente", subject: subjectId });
});
router.delete("/subjects/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.subjects.remove(id);
    res.status(200).json({ message: "Materia eliminada correctamente" });
});
export default router;