const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateUser = require("../middleware/authMiddleware");
const pool = require("../config/db");
const { getUserFavorites } = require("../models/favoritesModel");



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

router.post("/preferences", authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const { favoriteRouteId } = req.body;

    try {
        const result = await pool.query("SELECT preferences FROM users WHERE id = $1", [userId]);
        let preferences = result.rows[0].preferences || {};

        if (!Array.isArray(preferences.favorites)) {
            preferences.favorites = [];
        }

        if (!preferences.favorites.includes(Number(favoriteRouteId))) {
            preferences.favorites.push(Number(favoriteRouteId));
        }

        await pool.query("UPDATE users SET preferences = $1 WHERE id = $2", [preferences, userId]);

        res.json({ message: "Добавлено в избранное" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.get("/preferences", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ message: "Не авторизован" });

        const favorites = await getUserFavorites(userId); // должен возвращать массив маршрутов
        res.json(favorites);
    } catch (err) {
        console.error("Ошибка получения избранных:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post('/preferences/remove', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const routeId = Number(req.body.routeId); // <--- вот тут приведение к числу

    if (!routeId) {
        return res.status(400).json({ error: 'Route ID обязателен' });
    }

    try {
        const result = await pool.query(
            'SELECT preferences FROM users WHERE id = $1',
            [userId]
        );

        let preferences = result.rows[0]?.preferences || { favorites: [] };

        if (!Array.isArray(preferences.favorites)) {
            preferences.favorites = [];
        }

        if (!preferences.favorites.includes(routeId)) {
            return res.status(404).json({ error: 'Маршрут не найден в избранном' });
        }

        preferences.favorites = preferences.favorites.filter(id => id !== routeId);

        await pool.query(
            'UPDATE users SET preferences = $1 WHERE id = $2',
            [preferences, userId]
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Ошибка при удалении маршрута из избранного:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



module.exports = router;