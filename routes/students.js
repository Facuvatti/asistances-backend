const express = require("express");
const router = express.Router();
router.post("/students", async (req, res) => {
    let { year, division, specialty, students } = req.body;
    students = students.split("\n");
    let classID = await classroom.getId(year, division, specialty);
    let { inserts, errors } = await student.createMultiple(students, classID);
    res.status(201).set(headers).json({ message: "Todos los estudiantes insertados correctamente", inserts });
});

router.post("/student", async (req, res) => {
    let { lastname, name, classId } = req.body;
    let id = await student.create({ lastname, name, classId });
    res.status(201).set(headers).json([{ id }]);
});

router.get("/students/:classId", async (req, res) => {
    const { classId } = req.params;
    let students = await student.listByClassroom(classId);
    res.status(200).set(headers).json(students);
});

router.delete("/students/:id", async (req, res) => {
    const { id } = req.params;
    await student.remove(id);
    res.status(200).set(headers).json({ message: "Estudiante eliminado" });
});


module.exports = router;