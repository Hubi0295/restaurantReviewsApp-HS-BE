const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const { User, validateLogin, validateRegister } = require("../models/User")

router.use(cookieParser());

router.post("/login", async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error)
            return res.status(400).send({ message: "Blad walidacji loginu" })
        const user = await User.findOne({ email: req.body.email })
        if (!user)
            return res.status(401).send({ message: "Niepoprawne haslo lub mail" })
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if (!validPassword)
            return res.status(401).send({ message: "Niepoprawne haslo lub mail" })
        const token = user.generateAuthToken();
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 86400000,
        });

        res.json({
            message:"Zalogowano pomyślnie",
            username:user.firstName
            });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Blad serwera" })
    }
})
router.post("/register", async (req, res) => {
    try {
        console.log(req.body);
        const { error } = validateRegister(req.body)
        if (error)
            return res.status(400).send({ message: "Blad walidacji rejestracji" })
        const user = await User.findOne({ email: req.body.email })
        if (user)
            return res
                .status(409)
                .send({ message: "Uzytkownik z podanym mailem już istnieje" })
        const salt = await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        await new User({ ...req.body, password: hashPassword }).save()
        res.status(201).send({ message: "Uzytkownik pomyslnie utworzony" })
    } catch (error) {
        res.status(500).send({ message: "Blad serwera" })
    }
})

router.post('/logout',(req,res)=>{
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });
    res.json({ message: 'Wylogowano' });
})
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Brak tokena' });

        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ _id: decoded._id });
        if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });

        return res.status(200).json({ username: user.firstName });
    } catch (err) {
        return res.status(401).json({ message: 'Nieprawidłowy Token' });
    }
});



module.exports = router;
