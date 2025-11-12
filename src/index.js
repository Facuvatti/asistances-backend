// Requerimientos
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import Strategy from "passport-local";
import account from "./routes/account.js";
import courses from"./routes/courses.js";
import students from"./routes/students.js";
import asistances from "./routes/asistances.js";
import database from "./connection.js";
import dotenv from "dotenv";
dotenv.config()
const LocalStrategy = Strategy;
let app = express(); 
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT;
const db = await database.connect()

// Manejo de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy((name, password, done) => {
    try {
        let device = db.query("SELECT * FROM devices JOIN users ON devices.user = users.id WHERE name = ?", [name])
        device = device[0];
        if (!device.user) return done(null, {"fingerprint": device.fingerprint});
        bcrypt.compare(password, device.password, (err, res) => {
            if (err) done(err,false);
            if (!res) return done(null, false);
            else return done(null, device);
        });
    } catch (err) {done(err);}
}));
passport.serializeUser((device, done) => {
    if (!device.user) return done(null, {"fingerprint": device.fingerprint});
    done(null, {"userId": device.user});
});
passport.deserializeUser((identifier, done) => {
    if (identifier.userId) {
        try {
            let user = db.query("SELECT * FROM users WHERE id = ?", [identifier])
            user = user[0];
            done(null, user);
        } catch (err) {done(err);}
    }
    if(identifier.fingerprint) {
        try {
            let device = db.query("SELECT * FROM devices WHERE fingerprint = ?", [identifier])
            device = device[0];
            if (err) done(err);
            done(null, device);
        } catch (err) {done(err);}
    }
});





app.get("/", (req, res) => {
    let add ="";
    if (req.body) add = JSON.stringify(req.body);
    res.status(200).send("API funcionando: "+add);
});
app.use("/",account);
app.use("/",courses);
app.use("/",students);
app.use("/",asistances);

app.listen(port, () => console.log(`API funcionando en el puerto ${port}`));