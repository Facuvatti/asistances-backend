// Requerimientos
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
app.use("/",require("./routes/account.js"));
app.use("/",require("./routes/classes.js"));
app.use("/",require("./routes/students.js"));
app.use("/",require("./routes/asistances.js"));

app.listen(port, () => console.log(`API funcionando`));