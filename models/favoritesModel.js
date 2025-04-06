const pool = require("../config/db");

async function getUserFavorites(userId) {
    const result = await pool.query(`
        SELECT preferences
        FROM users
        WHERE id = $1
    `, [userId]);

    const preferences = result.rows[0]?.preferences || {};
    const favoriteIds = preferences.favorites || [];

    if (favoriteIds.length === 0) return [];

    const routesResult = await pool.query(`
        SELECT *
        FROM routes
        WHERE id = ANY($1)
    `, [favoriteIds]);

    return routesResult.rows;
}

module.exports = { getUserFavorites };
