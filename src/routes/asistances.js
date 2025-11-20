import {Asistance, addTables} from "../models.js";
import database from "../connection.js";
import express from "express";
const router = express.Router();
const db = await database.connect();
router.use(addTables({asistance: new Asistance(db, "asistances")}));

router.post("/asistances", async (req, res) => {
    let { studentId, presence } = req.body;
    await req.tables.asistance.create({studentId, presence});
    res.status(200).json({ message: "Asistencia creada", presence });
});

router.post("/asistances/get", async (req, res) => {
    const { course, date, subject} = req.body;
    let type;
    if(subject) type = {"subject" : subject};
    if(course) type = {"students.course" : course};
    let asistances = await req.tables.asistance.listByDate(type, date);
    if(asistances) res.status(200).json({asistances});
    else res.status(204).send();
    
});

router.get("/asistances/student/:id", async (req, res) => {
    const { id } = req.params;
    let asistances = await req.tables.asistance.listByStudent(id);
    res.status(200).json({asistances});
});

router.delete("/asistances/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.asistance.remove(id);
    res.status(200).json({ message: "Asistencia eliminada" });
});
export default router;