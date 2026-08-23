const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato: "Bearer token"

  if (!token) {
    return res.status(401).json({ success: false, message: "Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ success: false, message: "Token inválido" });

    req.usuario = usuario;
    next();
  });
};

module.exports = verificarToken;
