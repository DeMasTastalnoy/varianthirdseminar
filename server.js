const express = require('express');
const app = express();
const path = require("path");
const { create } = require("express-handlebars");  // Import create here
const exphbs = require("express-handlebars");



const hbs = create({
    helpers: {
        json: function(obj) {
            return JSON.stringify(obj);
        }
    },
    defaultLayout: "main", // указываем основной layout
    extname: "hbs",  // Указываем расширение
    partialsDir: path.join(__dirname, "views", "partial"), // Указываем директорию для partials
});
app.engine("hbs", hbs.engine);
app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // для обработки JSON-тел запросов
app.use(express.urlencoded({ extended: true }));