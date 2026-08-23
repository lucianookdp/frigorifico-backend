const express = require("express");
const router = express.Router();
const orcamentosController = require("../controllers/orcamentosController");
const verificarToken = require("../middleware/authMiddleware");

// Criar novo orçamento (aberto)
router.post("/", orcamentosController.criarOrcamento);

// ✅ NOVAS ROTAS protegidas com token JWT:
router.get("/", verificarToken, orcamentosController.listarOrcamentos);
router.delete("/:id", verificarToken, orcamentosController.deletarOrcamento);

module.exports = router;
