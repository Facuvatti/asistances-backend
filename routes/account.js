const express = require("express");
const router = express.Router();

router.post("/device", async (req, res) => {
    const { fingerprint } = req.body;
    const device = await db.prepare("SELECT id FROM devices WHERE fingerprint = ?").bind(fingerprint).first();
    if (!device) {
        result = await db.prepare("INSERT INTO devices (fingerprint) VALUES (?)").bind(fingerprint).run();
        res.status(201).json({ id: result.lastRowId, message: "Dispositivo creado con éxito" });
    } else {
        res.status(200).json({ id: device.id, message: "Dispositivo ya registrado" });
    }
});

router.post("/register", async (req, res) => {
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

router.post("/login", async (req, res) => {
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
module.exports = router;