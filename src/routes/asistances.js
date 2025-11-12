import {Asistance, addAuth} from "../models.js";
import express from "express";
const router = express.Router();
const db = process.env.DB
router.use(addAuth([new Asistance(db, "asistances")]));

router.post("/asistances", async (req, res) => {
    let { studentId, presence } = req.body;
    await req.tables.asistance.create(studentId, presence);
    res.status(200).set(headers).json({ message: "Asistencia creada", presence });
});

router.get("/asistances", async (req, res) => {
    const { classId, date, subject} = req.body;
    type;
    if(subject) type = {"subject" : subject};
    if(classId) type = {"student.class" : classId};
    let asistances = await req.tables.asistance.listByDate(type, date);
    res.status(200).set(headers).json(asistances);
});

router.get("/asistances/student/:id", async (req, res) => {
    const { id } = req.params;
    let asistances = await req.tables.asistance.listByStudent(id);
    res.status(200).set(headers).json(asistances);
});

router.delete("/asistances/:id", async (req, res) => {
    const { id } = req.params;
    await req.tables.asistance.remove(id);
    res.status(200).set(headers).json({ message: "Asistencia eliminada" });
});
export default router;