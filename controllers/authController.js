const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");

const login = (req, res) => {
  const { email, senha } = req.body;

  adminModel.getAdminByEmail(email, (err, results) => {
    if (err) {
      console.error("Erro no login:", err); // LOG DO ERRO DO BANCO
      return res.status(500).json({ success: false, message: "Erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    const admin = results[0];

    bcrypt.compare(senha, admin.senha, (err, isMatch) => {
      if (err) {
        console.error("Erro ao comparar senha:", err); // LOG DO ERRO DE COMPARAÇÃO
        return res.status(500).json({ success: false, message: "Erro na comparação de senha" });
      }

      if (isMatch) {
        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: "Senha incorreta" });
      }
    });
  });
};

module.exports = {
  login,
};
