const express = require("express");
const router = express.Router();
router.post("/asistances", async (req, res) => {
    let { studentId, presence } = req.body;
    await asistance.create(studentId, presence);
    res.status(200).set(headers).json({ message: "Asistencia creada", presence });
});

router.get("/asistances/:classId/:date", async (req, res) => {
    const { classId, date } = req.params;
    let asistances = await asistance.listByDate(classId, date);
    res.status(200).set(headers).json(asistances);
});

router.get("/asistances/student/:id", async (req, res) => {
    const { id } = req.params;
    let asistances = await asistance.listByStudent(id);
    res.status(200).set(headers).json(asistances);
});

router.delete("/asistances/:id", async (req, res) => {
    const { id } = req.params;
    await asistance.remove(id);
    res.status(200).set(headers).json({ message: "Asistencia eliminada" });
});
module.exports = router;