// Requerimientos
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import Strategy from "passport-local"
import account from "./routes/account.js"
import classes from"./routes/classes.js"
import students from"./routes/students.js"
import asistances from "./routes/asistances.js"
const LocalStrategy = Strategy;
let app = express(); 
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT;
const db = process.env.D1

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





app.get("/", (req, res) => {
    res.status(200).send("API funcionando");
});
app.use("/",require(account));
app.use("/",require(classes));
app.use("/",require(students));
app.use("/",require(asistances));

app.listen(port, () => console.log(`API funcionando`));