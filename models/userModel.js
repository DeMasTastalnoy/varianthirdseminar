const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
    create: async (name, email, password, role) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email",
            [name, email, hashedPassword, role]
        );
        return rows[0];
    },

    findByEmail: async (email) => {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        return rows[0];
    },

    findById: async (id) => {
        const { rows } = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
        return rows[0];
    },

    getUserProfile: async (id) => {
        console.log("Выполняем запрос к базе данных для id:", id);  // Проверяем ID
        const { rows } = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [id]
        );
        console.log("heres need something",rows[0]);
        return rows[0];
    },

};



module.exports = User;