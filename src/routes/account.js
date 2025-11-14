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
        req.isAuthenticated();
        if(req.user) res.status(200).json({ user: true});
        else res.status(200).json({user:false});
    } catch (err) {
        if(err.message == "Cannot read properties of undefined (reading 'user')") res.status(200).json({user:false});
        else {
            console.log(err);
            res.status(400).json({ error: err.message });
        }
    }
});
router.get("/account/profile",async (req, res) => {
    res.status(200).json(req.session.passport);
});
router.post("/account/register",redirectIfLoggedIn, async (req, res) => {
    const { name, password } = req.body;
    const exists = await db.query("select * from users where name = ?", [name]);
    if (exists[0]) return res.status(409).json({ error: "existe" });
    try {
        const salt = await bcrypt.genSalt(10);
        const hexHash = await bcrypt.hash(password, salt);
        const user = await db.query("INSERT INTO users (name, password) VALUES (?, ?)", [name, hexHash]);
        const userId = user.lastRowId;
        req.login({ id: userId }, err => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ registered: true, userId, message:"Usuario creado correctamente"});
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
        next(err);
    }
});

router.post("/account/login",redirectIfLoggedIn,passport.authenticate('local'), async (req, res) => {
    if (!req.user) return res.status(404).json({ error: "no existe" });
    res.status(200).json({ message: "Iniciaste sesión correctamente",loggedIn: true, user: req.user  });
});
router.post('/account/logout', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'No estas autenticado' });
    req.logout(err => {
        if (err) return res.status(500).json({ error: 'Error cerrando sesión' });
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.status(204).send(true);
        });
    });
});
export default router;