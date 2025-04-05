const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateUser = require("../middleware/authMiddleware");
const pool = require("../config/db");


// Страница редактирования профиля
router.get("/profile", authenticateUser, userController.getProfile);

router.get("/search", async (req, res) => {
    const { name } = req.query;

    if (!name) return res.status(400).json({ error: "Введите имя для поиска" });

    try {
        const result = await pool.query(
            "SELECT id, name FROM users WHERE name ILIKE $1 LIMIT 10",
            [`%${name}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка при поиске пользователей:", err);
        res.status(500).json({ error: "Ошибка при поиске пользователей" });
    }
});

module.exports = router;