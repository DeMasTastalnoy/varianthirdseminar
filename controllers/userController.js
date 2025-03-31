const User = require("../models/userModel");

exports.getProfile = async (req, res) => { //const без точки или exports с точкой
    console.log("req.user:", req.user);
    console.log("Здесь вызываем функцию getProfile")
    try {
        const user = await User.getUserProfile(req.user.id); // Загружаем профиль из БД
        console.log("Отправляемый user:", user);
        res.render("profile", { user });
    } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        res.status(500).send("Ошибка сервера");
    }
};