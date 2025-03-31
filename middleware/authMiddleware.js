const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token; // Читаем токен из cookie

    if (!token) {
        return res.redirect("/login"); // Перенаправление на логин, если нет токена
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Расшифрованный токен:", decoded);
        req.user = decoded; // Добавляем расшифрованные данные в req.user
        next();
    } catch (err) {
        console.error("Ошибка верификации токена:", err);
        res.clearCookie("token"); // Удаляем невалидный токен
        res.redirect("/login");
    }
};

module.exports = authenticateUser;
