const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

// api/auth/register
router.post(
  "/register",
  [
    check("email", "Некорректный email").isEmail(),
    check("password", "Минимальная длина пароля 6 символов").isLength({min: 6}),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      //console.log("Body:", req.body);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }
      // Логика регистрации пользователя
      const { email, password } = req.body;

      const canidate = await User.findOne({ email });

      if (canidate) {
        return res
          .status(400)
          .json({ message: "Такой пользователь уже существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({ email, password: hashedPassword });

      await user.save();

      return res.status(201).json({ message: "Пользователь создан" });
    } catch (e) {
      res.status(500).json({ message: `Чтото пошло не так попробуйте снова (${e.message})` });
    }
  }
);

// api/auth/login
router.post("/login", 
[
  check("email", "Введите корректный email").normalizeEmail().isEmail(),
  check("password", "Введите пароль").exists()
],
async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некорректные данные при входе в систему'
      })
    }
    // Логика входа пользователя в систему
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Пользователь не найден" });
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Неверный пароль. Попробуйте снова" });
    }

    // Создание токена для аутентификации
    const token = jwt.sign(
      {userId: user.id},
      config.get('jwtSecret'),
      {expiresIn: '1h'}
      )

    return res.json({ token, userId: user.id });
    
  } catch (e) {
    res.status(500).json({ message: `Чтото пошло не так попробуйте снова (${e.message})` });
  }
}
);

module.exports = router;
