import {Table} from "models.js"
const express = require("express");
const router = express.Router();
const db = process.env.DB
const classroom = new Table(db,"classroom");
router.get("/classes/years", async (req, res) => {
    classroom.auth = req.user;
    let years = await classroom.listAttr("year");
    res.status(200).set(headers).json(years);
});

router.get("/classes/divisions", async (req, res) => {
    classroom.auth = req.user;
    let divisions = await classroom.listAttr("division");
    res.status(200).set(headers).json(divisions);
});

router.get("/classes/specialties", async (req, res) => {
    classroom.auth = req.user;
    let specialties = await classroom.listAttr("specialty");
    res.status(200).set(headers).json(specialties);
});

router.get("/classes/:year/:division/:specialty", async (req, res) => {
    classroom.auth = req.user;
    const { year, division, specialty } = req.params;
    console.log(year, division, specialty);
    let classId = await classroom.getId(year, division, specialty);
    res.status(200).set(headers).json([{ id: classId }]);
});

router.get("/classes", async (req, res) => {
    classroom.auth = req.user;
    let classes = await classroom.list();
    console.log(classes);
    res.status(200).set(headers).json(classes);
});

router.delete("/classes/:id", async (req, res) => {
    classroom.auth = req.user;
    const { id } = req.params;
    await classroom.remove(id);
    res.status(200).set(headers).json({ message: "Clase eliminada" });
});
module.exports = router;