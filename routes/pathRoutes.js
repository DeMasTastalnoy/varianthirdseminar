const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

// ✅ Создание маршрута
// router.post("/", authenticateUser, async (req, res) => {
//     const { name, description } = req.body;
//     try {
//         const result = await pool.query(
//             "INSERT INTO routes (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
//             [req.user.id, name, description]
//         );
//         res.json(result.rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: "Ошибка при создании маршрута" });
//     }
// });
router.post("/", authenticateUser, async (req, res) => {
    const { name, description, coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || !coordinates.length) {
        return res.status(400).json({ error: "Некорректные координаты" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO routes (user_id, name, description, coordinates) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.user.id, name, description, JSON.stringify(coordinates)]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Ошибка при создании маршрута:", err);
        res.status(500).json({ error: "Ошибка при создании маршрута" });
    }
});

// ✅ Получение всех маршрутов
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM routes");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении маршрутов" });
    }
});

// ✅ Обновление маршрута
router.put("/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            "UPDATE routes SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
            [name, description, id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Маршрут не найден" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении маршрута" });
    }
});

// ✅ Удаление маршрута
router.delete("/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM routes WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Маршрут не найден" });
        res.json({ message: "Маршрут удалён" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при удалении маршрута" });
    }
});

module.exports = router;
