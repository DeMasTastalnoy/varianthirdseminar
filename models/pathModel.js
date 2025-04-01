const pool = require("../config/db"); // Подключаем пул соединений PostgreSQL

async function getRouteFromDB(routeId) {
    try {
        const result = await pool.query("SELECT * FROM routes WHERE id = $1", [routeId]);
        return result.rows[0] || null; // Вернём объект маршрута или null
    } catch (error) {
        console.error("Ошибка запроса к базе:", error);
        throw error;
    }
}

module.exports = { getRouteFromDB };
