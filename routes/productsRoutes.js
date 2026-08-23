const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const productsController = require("../controllers/productsController");
const verificarToken = require("../middleware/authMiddleware");

// Criar pasta de uploads, se necessário
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Pasta 'uploads' criada automaticamente.");
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

/**
 * ROTAS PÚBLICAS
 */
router.get("/destaques", productsController.getDestaques);
router.get("/frigorifico", productsController.getFrigorifico);
router.get("/acougue", productsController.getAcougue);
router.get("/", productsController.getAll);
router.get("/:id", productsController.getById);

/**
 * ROTAS PRIVADAS
 */
router.post("/", verificarToken, upload.single("foto"), productsController.create);
router.put("/:id", verificarToken, upload.single("foto"), productsController.update);
router.patch("/:id/destaque", verificarToken, productsController.toggleDestaque);
router.delete("/:id", verificarToken, productsController.remove);

module.exports = router;
