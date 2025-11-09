// Requerimientos
import {Classroom, Student, Asistance} from "./models/models.js";
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session  = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
let app = express(); 
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Manejo de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy((name, password, done) => {
    db.prepare("SELECT * FROM devices JOIN users ON devices.user = users.id WHERE name = ?").bind(name).first((err, device) => {
        if (err) done(err);
        if (!device.user) return done(null, {"fingerprint": device.fingerprint});
        bcrypt.compare(password, device.password, (err, res) => {
            if (err) done(err,false);
            if (!res) return done(null, false);
            else return done(null, device);
        });
    });
}));
passport.serializeUser((device, done) => {
    if (!device.user) return done(null, {"fingerprint": device.fingerprint});
    done(null, {"userId": device.user});
});
passport.deserializeUser((identifier, done) => {
    if (identifier.userId) {
        db.prepare("SELECT * FROM users WHERE id = ?").bind(identifier).first((err, user) => {
            if (err) done(err);
            done(null, user);
        });
    }
    if(identifier.fingerprint) {
        db.prepare("SELECT * FROM devices WHERE fingerprint = ?").bind(identifier).first((err, device) => {
            if (err) done(err);
            done(null, device);
        });
    }
});


const port = process.env.PORT || 3000;
const db = process.env.DB

let classroom = new Classroom(db);
let student = new Student(db);
let asistance = new Asistance(db);

app.get("/", (req, res) => {
    res.status(200).send("API funcionando");
});

app.post("/device", async (req, res) => {
    const { fingerprint } = req.body;
    const device = await db.prepare("SELECT id FROM devices WHERE fingerprint = ?").bind(fingerprint).first();
    if (!device) {
        result = await db.prepare("INSERT INTO devices (fingerprint) VALUES (?)").bind(fingerprint).run();
        res.status(201).json({ id: result.lastRowId, message: "Dispositivo creado con éxito" });
    } else {
        res.status(200).json({ id: device.id, message: "Dispositivo ya registrado" });
    }
});

app.post("/register", async (req, res) => {
    const { name, password, fingerprint } = req.body;
    try {
        const hexHash = bcrypt.genSalt(10,(err, salt) => {
            if(err) throw err;
            console.log(salt);
            const hash = bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                return hash;
            });
            return hash;
        });
        res.status(201).json(user);
        const user = await db.prepare("INSERT INTO users (name, password) VALUES (?, ?)").bind(name, hexHash).run();
        const userId = user.lastRowId;
        const device = await db.prepare("SELECT id FROM devices WHERE fingerprint = ?").bind(fingerprint).first();
        await db.prepare("UPDATE devices SET user = ? WHERE id = ?").bind(userId, device.id).run();
        const session = await createSession(db, device.id);
        const headers = {"Set-Cookie": `session=${session.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400` };
        res.status(201).set(headers).json({ id: userId, message: "Usuario creado con éxito" });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    const { name, password, fingerprint } = req.body;
    const user = await db.prepare("SELECT * FROM users WHERE name = ?").bind(name).first();
    if (!user) return res.status(404).set(headers).json({ error: "Usuario no encontrado" });
    const dbHash = user.password;
    const valid = await bcrypt.compare(password, dbHash);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });
    const device = await db.prepare("SELECT user FROM devices WHERE fingerprint = ?").bind(fingerprint).first();
    if (device.user == null) await db.prepare("UPDATE devices SET user = ? WHERE fingerprint = ?").bind(user.id, fingerprint).run();
    const session = await createSession(db, device.id);
    const headers = {"Set-Cookie": `session=${session.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400` };
    res.status(200).set(headers).json({ message: "Login exitoso" });
});

app.post("/students", async (req, res) => {
    let { year, division, specialty, students } = req.body;
    students = students.split("\n");
    let classID = await classroom.getId(year, division, specialty);
    let { inserts, errors } = await student.createMultiple(students, classID);
    res.status(201).set(headers).json({ message: "Todos los estudiantes insertados correctamente", inserts });
});

app.post("/student", async (req, res) => {
    let { lastname, name, classId } = req.body;
    let id = await student.create({ lastname, name, classId });
    res.status(201).set(headers).json([{ id }]);
});

app.get("/students/:classId", async (req, res) => {
    const { classId } = req.params;
    let students = await student.listByClassroom(classId);
    res.status(200).set(headers).json(students);
});

app.delete("/students/:id", async (req, res) => {
    const { id } = req.params;
    await student.remove(id);
    res.status(200).set(headers).json({ message: "Estudiante eliminado" });
});

app.get("/years", async (req, res) => {
    let years = await classroom.listAttr("year");
    res.status(200).set(headers).json(years);
});

app.get("/divisions", async (req, res) => {
    let divisions = await classroom.listAttr("division");
    res.status(200).set(headers).json(divisions);
});

app.get("/specialties", async (req, res) => {
    let specialties = await classroom.listAttr("specialty");
    res.status(200).set(headers).json(specialties);
});

app.get("/class/:year/:division/:specialty", async (req, res) => {
    const { year, division, specialty } = req.params;
    console.log(year, division, specialty);
    let classId = await classroom.getId(year, division, specialty);
    res.status(200).set(headers).json([{ id: classId }]);
});

app.get("/classes", async (req, res) => {
    let classes = await classroom.list();
    console.log(classes);
    res.status(200).set(headers).json(classes);
});

app.delete("/class/:id", async (req, res) => {
    const { id } = req.params;
    await classroom.remove(id);
    res.status(200).set(headers).json({ message: "Clase eliminada" });
});

app.post("/asistances", async (req, res) => {
    let { studentId, presence } = req.body;
    await asistance.create(studentId, presence);
    res.status(200).set(headers).json({ message: "Asistencia creada", presence });
});

app.get("/asistances/:classId/:date", async (req, res) => {
    const { classId, date } = req.params;
    let asistances = await asistance.listByDate(classId, date);
    res.status(200).set(headers).json(asistances);
});

app.get("/student/asistances/:student", async (req, res) => {
    const { student } = req.params;
    let asistances = await asistance.listByStudent(student);
    res.status(200).set(headers).json(asistances);
});

app.delete("/asistances/:id", async (req, res) => {
    const { id } = req.params;
    await asistance.remove(id);
    res.status(200).set(headers).json({ message: "Asistencia eliminada" });
});


app.listen(port, () => console.log(`API funcionando en el puerto ${port}`));