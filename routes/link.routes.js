const { Router } = require("express");
const Link = require("../models/Link");
const router = Router();
const config = require("config");
const shortid = require("shortid");
const auth = require("../middleware/auth.middleware");

// api/link/generate
// Основная логика по генерации ссылки
// Добавлен middleware метод auth, для того чтоб только автиризованные пользователи могли создавать ссылки
router.post("/generate", auth, async (req, res) => {
  try {
    const baseUrl = config.get("baseUrl");
    const { from } = req.body;

    const code = shortid.generate();

    const existing = await Link.findOne({ from });
    // Если такая ссылка уже есть, то её отправляем как результат
    if (existing) {
      return res.json({ link: existing });
    }

    const to = baseUrl + "/t/" + code;
    const link = new Link({
      code,
      to,
      from,
      owner: req.user.userId,
    });
    
    await link.save();

    res.status(201).json({ link });

  } catch (e) {
    res
      .status(500)
      .json({ message: `Чтото пошло не так попробуйте снова (${e.message})` });
  }
});

// api/link (получаем все линки данного пользователя)
router.get("/", auth, async (req, res) => {
  try {
    const links = await Link.find({ owner: req.user.userId });
    res.json(links);
  } catch (e) {
    res
      .status(500)
      .json({ message: `Чтото пошло не так попробуйте снова (${e.message})` });
  }
});

// api/link/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    res.json(link);
  } catch (e) {
    res
      .status(500)
      .json({ message: `Чтото пошло не так попробуйте снова (${e.message})` });
  }
});

module.exports = router;
