const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'newdb',
    password:'uits12345',
    port: 5432,
});

client.connect()
    .then(() => console.log("Подключение к базе данных установлено"))
    .catch(err => console.error("Ошибка подключения к базе данных:", err));

module.exports = client;