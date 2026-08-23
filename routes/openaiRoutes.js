const express = require("express");
const router = express.Router();
const { chatWithGPT } = require("../controllers/openaiController");

router.post("/chat", chatWithGPT);

module.exports = router;
