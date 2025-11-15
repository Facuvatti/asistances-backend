import express from "express";
import database from "../connection.js";
import bcrypt from "bcrypt";
import passport from "passport";
const router = express.Router();
const db = await database.connect();
function redirectIfLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return res.status(409).json({ error: 'Ya estás autenticado' });
    next();
}
router.get("/account", async (req, res) => {
    try {
        let user = false;
        if(req.user) user = true;
        res.status(200).json({ logged: req.isAuthenticated(), user: user || false });
    } catch (err) {
        if(err.message == "Cannot read properties of undefined (reading 'user')") res.status(200).json({user:false});
        else {
            console.error(err);
            res.status(400).json({ error: err.message });
        }
    }
});
router.get("/account/profile",async (req, res) => {
    if(req.isAuthenticated()){
        res.status(200).json(req.user);
    } else res.status(401).json({ error: 'No estas autenticado' });
});
router.post("/account/register",redirectIfLoggedIn, async (req, res) => {
    const { name, password } = req.body;
    const exists = await db.query("select * from users where name = ?", [name]);
    if (exists[0]) return res.status(409).json({ error: "existe" });
    try {
        const salt = await bcrypt.genSalt(10);
        const hexHash = await bcrypt.hash(password, salt);
        const user = await db.query("INSERT INTO users (name, password) VALUES (?, ?)", [name, hexHash]);

        req.login(user, err => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ registered: true, userId, message:"Usuario creado correctamente"});
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
        next(err);
    }
});
router.post("/account/login",redirectIfLoggedIn, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: "no existe" , message: info?.message || "Login fallido" });

        req.login(user, (err) => {
            if (err) return next(err);

            return res.status(200).json({
                message: "Iniciaste sesión correctamente",
                logged: true,
                user: user.id
            });
        });
    })(req, res, next);
});
router.post('/account/logout', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'No estas autenticado' });
    req.logout(err => {
        if (err) return res.status(500).json({ error: 'Error cerrando sesión' });
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.status(204).json({ logged: false, message:"Sesion cerrada correctamente" });
        });
    });
});
export default router;