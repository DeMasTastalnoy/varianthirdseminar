const express = require('express');
const app = express();
require("dotenv").config();
const dotenv = require("dotenv");
const path = require("path");
const { create } = require("express-handlebars");  // Import create here
const exphbs = require("express-handlebars");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Путь к маршрутам пользователя
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authenticateUser = require("./middleware/authMiddleware");
const pathRouter = require("./routes/pathRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bodyParser = require('body-parser');


require("dotenv").config();

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
app.use(cookieParser());
app.use(bodyParser.json());
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            console.error("Ошибка валидации токена:", err.message);
        }
    }
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/routes", pathRouter);
app.use("/api/reviews", reviewRouter);

app.get("/register", (req, res) => res.render("./layouts/register"));
app.get("/login", (req, res) => res.render("./layouts/login"));

app.get("/profile", authenticateUser,(req, res) => {
    try {
        console.log("Запрос на /profile получен");
        if (!req.user) {
            return res.redirect("/login"); // Если нет токена, перенаправляем
        }
        const user = req.user || {name: "Гость", email: "guest@example.com"};
        const userId = req.user.id; // Получаем ID авторизованного пользователя
        console.log(user);

        res.render("./layouts/profile", {user});
    }catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        res.status(500).send("Ошибка сервера");
    }
});

let routes = [
    { id: 1, name: "Маршрут по Москве", description: "Прогулка по историческим местам Москвы", coordinates: [55.751244, 37.618423], reviews: [] },
    { id: 2, name: "Маршрут по Санкт-Петербургу", description: "Экскурсия по Санкт-Петербургу", coordinates: [59.9342802, 30.3350986], reviews: [] },
];

// Получение всех маршрутов
app.get('/api/routes', (req, res) => {
    res.json(routes);
});

// Получение одного маршрута по ID
app.get('/api/routes/:id', (req, res) => {
    const route = routes.find(r => r.id === parseInt(req.params.id));
    res.json(route);
});


app.post('/api/routes', (req, res) => {
    const { name, description, coordinates } = req.body;

    if (!name || !coordinates || !Array.isArray(coordinates) || !coordinates.length) {
        return res.status(400).json({ error: "Некорректные данные" });
    }

    const newRoute = {
        id: routes.length + 1,
        name,
        description,
        coordinates,
        reviews: []
    };

    routes.push(newRoute);
    res.json(newRoute);
});

// Добавление отзыва для маршрута
app.post('/api/routes/:id/reviews', (req, res) => {
    const route = routes.find(r => r.id === parseInt(req.params.id));
    const newReview = req.body;
    route.reviews.push(newReview);
    res.json(route);
});

// app.get("/home", (req, res) => res.render("./layouts/home"));

app.get("/home", (req, res) => {
    try {
        console.log("Запрос на /home получен");
        if (!req.user) {
            return res.redirect("/login"); // Если нет токена, перенаправляем
        }
        const user = req.user || {name: "Гость", email: "guest@example.com"};
        const userId = req.user.id; // Получаем ID авторизованного пользователя
        console.log(user);

        res.render("./layouts/home", {user});
    }catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        res.status(500).send("Ошибка сервера");
    }
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});