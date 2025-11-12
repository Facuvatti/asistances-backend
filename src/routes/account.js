import express from "express";
import database from "../connection.js";
const router = express.Router();
const db = await database.connect();
router.post("/device", async (req, res) => {
    const { fingerprint } = req.body;
    let device = await db.query("SELECT id FROM devices WHERE fingerprint = ?", [fingerprint]);
    device = device[0];
    if (!device) {
        result = await db.query("INSERT INTO devices (fingerprint) VALUES (?)", [fingerprint]);
        res.status(201).json({ id: result.lastRowId, message: "Dispositivo creado con éxito" });
    } else {
        res.status(200).json({ id: device.id, message: "Dispositivo ya registrado" });
    }
});
router.get("/account", async (req, res) => {
    try {
        if(req.session.passport.user) res.status(200).send(true);
        else res.status(200).send(false);
    } catch (err) {
        if(err.message == "Cannot read properties of undefined (reading 'user')") res.status(200).send(false);
        else {
            console.log(err);
            res.status(400).json({ error: err.message });
        }
    }
});
router.get("/account/profile",async (req, res) => {
    res.status(200).json(req.session.passport);
});
router.post("/account/register", async (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) res.status(403).json({ error: 'Ya estás autenticado' });
  
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
        const user = await db.query("INSERT INTO users (name, password) VALUES (?, ?)", [name, hexHash]);
        const userId = user.lastRowId;
        let device = await db.query("SELECT id FROM devices WHERE fingerprint = ?", [fingerprint]);
        device = device[0];
        await db.query("UPDATE devices SET user = ? WHERE id = ?", [userId, device.id]);
        const session = await createSession(db, device.id);
        const headers = {"Set-Cookie": `session=${session.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400` };
        res.status(201).set(headers).send("Usuario creado con éxito");
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

router.post("/account/login", async (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) res.status(403).json({ error: 'Ya estás autenticado' });
    const { name, password, fingerprint } = req.body;
    let user = await db.query("SELECT * FROM users WHERE name = ?", [name]);
    user = user[0];
    if (!user) return res.status(404).set(headers).json({ error: "Usuario no encontrado" });
    const dbHash = user.password;
    const valid = await bcrypt.compare(password, dbHash);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });
    let device = await db.query("SELECT user FROM devices WHERE fingerprint = ?", [fingerprint]);
    device = device[0];
    if (device.user == null) await db.query("UPDATE devices SET user = ? WHERE fingerprint = ?", [user.id, fingerprint]);
    const session = await createSession(db, device.id);
    const headers = {"Set-Cookie": `session=${session.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400` };
    res.status(200).set(headers).json({ message: "Logueado exitosamente" });
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