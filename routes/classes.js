const express = require("express");
const router = express.Router();

router.get("/classes/years", async (req, res) => {
    let years = await classroom.listAttr("year");
    res.status(200).set(headers).json(years);
});

router.get("/classes/divisions", async (req, res) => {
    let divisions = await classroom.listAttr("division");
    res.status(200).set(headers).json(divisions);
});

router.get("/classes/specialties", async (req, res) => {
    let specialties = await classroom.listAttr("specialty");
    res.status(200).set(headers).json(specialties);
});

router.get("/classes/:year/:division/:specialty", async (req, res) => {
    const { year, division, specialty } = req.params;
    console.log(year, division, specialty);
    let classId = await classroom.getId(year, division, specialty);
    res.status(200).set(headers).json([{ id: classId }]);
});

router.get("/classes", async (req, res) => {
    let classes = await classroom.list();
    console.log(classes);
    res.status(200).set(headers).json(classes);
});

router.delete("/class/:id", async (req, res) => {
    const { id } = req.params;
    await classroom.remove(id);
    res.status(200).set(headers).json({ message: "Clase eliminada" });
});
module.exports = router;