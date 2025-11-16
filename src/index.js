// Requerimientos
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
// import MySQLStore from "express-mysql-session";
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
app.use(cors({
    origin: "http://localhost:5500",  // o el puerto real de tu frontend
    credentials: true}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT;
const db = await database.connect()
// const SessionStore = MySQLStore(session);
// const store = new SessionStore({
//     host: process.env.db_host,
//     port: process.env.db_port,
//     user: process.env.db_user,     
//     password: process.env.db_password,
//     database: process.env.db_name,
//     ssl: true
// });
// Manejo de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // store: store,
    cookie: {
        httpOnly: true,
        secure: false,      // IMPORTANTE: en desarrollo tiene que ser false pero en produccion importante que sea true
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: "name",passwordField: "password"},
    async (name, password, done) => {
    try{
        let result = await db.query("SELECT * FROM users WHERE name = ?", [name]);
        let user = result[0];
        console.log("USER EN REGISTER:", user);
        if (!user) return done(null, false, { message: "Usuario no encontrado" });

        const match = await bcrypt.compare(password, user.password);

        if (!match) return done(null, false, { message: "Contraseña inválida" });

        return done(null, user);
    } catch (err) {
        console.error(err);
        done(err, false);
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser( async (userId, done) => {
    try {
        let user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        user = user[0];
        done(null, user);
    } catch (err) {
        console.error(err);
        done(err, false);
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