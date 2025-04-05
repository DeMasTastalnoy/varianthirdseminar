const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");


router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        // Получаем список друзей из users.friends
        const friendsQuery = `
            SELECT friends FROM users WHERE id = $1
        `;
        const friendsResult = await pool.query(friendsQuery, [user_id]);

        if (friendsResult.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const friendIds = friendsResult.rows[0].friends; // это массив int

        if (!friendIds || friendIds.length === 0) {
            return res.json([]); // Нет друзей
        }

        // Теперь получаем информацию о друзьях и их избранных маршрутах
        const query = `
            SELECT users.id, users.name,
                   r.id AS route_id,
                   r.name AS route_name
            FROM users
                     LEFT JOIN LATERAL jsonb_array_elements_text(users.preferences) AS route(route_id) ON TRUE
                LEFT JOIN routes r ON route.route_id::int = r.id
            WHERE users.id = ANY($1)
        `;

        const result = await pool.query(query, [friendIds]);
        console.log(result);

        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка при получении друзей и маршрутов:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// routes/friends.js
router.post("/add", async (req, res) => {
    const token = req.cookies.token;
    const { friendId } = req.body;
    // console.log(req.body);

    if (!token) return res.status(401).json({ error: "Нет токена" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!friendId || userId === friendId) {
            return res.status(400).json({ error: "Некорректный ID друга" });
        }

        // Получаем текущий список друзей
        const result = await pool.query("SELECT friends FROM users WHERE id = $1", [userId]);
        const currentFriends = result.rows[0]?.friends || [];

        // Проверка — уже есть в друзьях?
        if (currentFriends.includes(friendId)) {
            return res.status(400).json({ error: "Этот пользователь уже в друзьях" });
        }

        const updatedFriends = [...currentFriends, friendId];

        // Обновляем массив друзей
        await pool.query("UPDATE users SET friends = $1 WHERE id = $2", [updatedFriends, userId]);

        res.json({ message: "Друг добавлен" });
    } catch (err) {
        console.error("Ошибка при добавлении друга:", err);
        res.status(500).json({ error: "Ошибка при добавлении друга" });
    }
});


module.exports = router;