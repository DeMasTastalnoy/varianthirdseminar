const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

// ✅ Добавление отзыва
router.post("/", authenticateUser, async (req, res) => {
    const { route_id, rating, comment } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO reviews (user_id, route_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.user.id, route_id, rating, comment]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при добавлении отзыва" });
    }
});

// ✅ Получение отзывов к маршруту
router.get("/:route_id", async (req, res) => {
    const { route_id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM reviews WHERE route_id = $1", [route_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении отзывов" });
    }
});

// ✅ Обновление отзыва
router.put("/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    try {
        const result = await pool.query(
            "UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
            [rating, comment, id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Отзыв не найден" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении отзыва" });
    }
});

// ✅ Удаление отзыва
router.delete("/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Отзыв не найден" });
        res.json({ message: "Отзыв удалён" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при удалении отзыва" });
    }
});

module.exports = router;
