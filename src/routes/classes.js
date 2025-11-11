import {Table, addAuth} from "../models.js"
const express = require("express");
const router = express.Router();
const db = process.env.DB

router.use(addAuth([new Table(db,"classroom")]));
router.get("/classes/years", async (req, res) => {
    classroom.auth = req.session.passport;
    let years = await req.tables.classroom.listAttr("year");
    res.status(200).set(headers).json(years);
});

router.get("/classes/divisions", async (req, res) => {
    classroom.auth = req.session.passport;
    let divisions = await req.tables.classroom.listAttr("division");
    res.status(200).set(headers).json(divisions);
});

router.get("/classes/specialties", async (req, res) => {
    classroom.auth = req.session.passport;
    let specialties = await req.tables.classroom.listAttr("specialty");
    res.status(200).set(headers).json(specialties);
});

router.get("/classes/:year/:division/:specialty", async (req, res) => {
    classroom.auth = req.session.passport;
    const { year, division, specialty } = req.params;
    console.log(year, division, specialty);
    let classId = await req.tables.classroom.getId(year, division, specialty);
    res.status(200).set(headers).json([{ id: classId }]);
});

router.get("/classes", async (req, res) => {
    classroom.auth = req.session.passport;
    let classes = await req.tables.classroom.list();
    console.log(classes);
    res.status(200).set(headers).json(classes);
});

router.delete("/classes/:id", async (req, res) => {
    classroom.auth = req.session.passport;
    const { id } = req.params;
    await req.tables.classroom.remove(id);
    res.status(200).set(headers).json({ message: "Clase eliminada" });
});
export default router;