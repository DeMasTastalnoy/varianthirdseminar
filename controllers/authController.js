const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const generateToken = (user) => {
    return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


exports.register = async (req, res) => {
    try {
        console.log("Запрос на регистрацию:", req.body);

        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }


        // Проверяем, есть ли пользователь с таким email
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Пользователь уже существует" });
        }

        console.log("Создание нового пользователя...");
        // Создаем пользователя
        const newUser = await User.create(name, email, password, role );
        console.log("Пользователь создан:", newUser);
        const token = generateToken(newUser);

        res.status(201).json({ user: newUser, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ error: "Неверный email или пароль" });
        }

        // Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Неверный email или пароль" });
        }

        const token = generateToken(user);
        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getMe = (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
};