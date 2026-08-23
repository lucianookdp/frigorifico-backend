const db = require("../config/db");

// Buscar todos os produtos
const getAllProducts = (callback) => {
  const query = "SELECT * FROM produtos";
  db.query(query, callback);
};

// Buscar produto por ID
const getProductById = (id, callback) => {
  const query = "SELECT * FROM produtos WHERE id = ?";
  db.query(query, [id], callback);
};

// Buscar produtos em destaque
const getDestaqueProducts = (callback) => {
  const query = "SELECT * FROM produtos WHERE destaque = true LIMIT 4";
  db.query(query, callback);
};

// Buscar produtos da categoria Frigorifico
const getFrigorificoProducts = (callback) => {
  const query = "SELECT * FROM produtos WHERE local = 'Frigorifico'";
  db.query(query, callback);
};

// Buscar produtos da categoria Acougue
const getAcougueProducts = (callback) => {
  const query = "SELECT * FROM produtos WHERE local = 'Acougue'";
  db.query(query, callback);
};

// Criar novo produto
const createProduct = (produto, callback) => {
  const query = "INSERT INTO produtos (titulo, descricao, valorKg, foto, destaque, categoria, local) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [
    produto.titulo,
    produto.descricao,
    produto.valorKg,
    produto.foto,
    produto.destaque,
    produto.categoria,
    produto.local,
  ];
  db.query(query, values, callback);
};

// Atualizar produto
const updateProduct = (id, produto, callback) => {
  const query = "UPDATE produtos SET titulo = ?, descricao = ?, valorKg = ?, foto = ?, destaque = ?, categoria = ?, local = ? WHERE id = ?";
  const values = [
    produto.titulo,
    produto.descricao,
    produto.valorKg,
    produto.foto,
    produto.destaque,
    produto.categoria,
    produto.local,
    id,
  ];
  db.query(query, values, callback);
};

// Atualizar destaque
const updateDestaque = (id, destaque, callback) => {
  const query = "UPDATE produtos SET destaque = ? WHERE id = ?";
  db.query(query, [destaque, id], callback);
};

// Deletar produto
const deleteProduct = (id, callback) => {
  const query = "DELETE FROM produtos WHERE id = ?";
  db.query(query, [id], callback);
};

module.exports = {
  getAllProducts,
  getProductById,
  getDestaqueProducts,
  getFrigorificoProducts,
  getAcougueProducts,
  createProduct,
  updateProduct,
  updateDestaque,
  deleteProduct,
};
