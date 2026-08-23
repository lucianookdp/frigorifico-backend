const fs = require("fs");
const path = require("path");
const productModel = require("../models/productModel");

// Listar todos os produtos
const getAll = (req, res) => {
  productModel.getAllProducts((err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar produtos" });
    res.json(results);
  });
};

// Buscar por ID
const getById = (req, res) => {
  const id = req.params.id;
  productModel.getProductById(id, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar produto" });
    if (results.length === 0) return res.status(404).json({ success: false, message: "Produto não encontrado" });
    res.json(results[0]);
  });
};

// Buscar produtos em destaque
const getDestaques = (req, res) => {
  productModel.getDestaqueProducts((err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar destaques" });
    res.json(results);
  });
};

// Buscar produtos da categoria Frigorifico
const getFrigorifico = (req, res) => {
  productModel.getFrigorificoProducts((err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar produtos da categoria Frigorífico" });
    res.json(results);
  });
};

// Buscar produtos da categoria Acougue
const getAcougue = (req, res) => {
  productModel.getAcougueProducts((err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar produtos da categoria Açougue" });
    res.json(results);
  });
};

// Criar novo produto
const create = (req, res) => {
  const { titulo, descricao, valorKg, destaque, categoria, local } = req.body;

  if (!titulo || !descricao || !valorKg || !categoria || !local || !req.file) {
    return res.status(400).json({ success: false, message: "Preencha todos os campos e adicione a imagem" });
  }

  const foto = `/api/uploads/${req.file.filename}`;
  const destaqueFinal = destaque === "true" || destaque === true ? 1 : 0;

  const novoProduto = { titulo, descricao, valorKg, foto, destaque: destaqueFinal, categoria, local };

  productModel.createProduct(novoProduto, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao cadastrar produto" });
    }

    res.status(201).json({
      success: true,
      message: "Produto cadastrado com sucesso",
      id: result.insertId,
    });
  });
};

// Atualizar produto
const update = (req, res) => {
  const id = req.params.id;
  const { titulo, descricao, valorKg, destaque, categoria, local, foto: fotoAtual } = req.body;

  if (!titulo || !descricao || !valorKg || !categoria || !local) {
    return res.status(400).json({ success: false, message: "Preencha todos os campos corretamente" });
  }

  let foto;
  if (req.file) {
    foto = `/api/uploads/${req.file.filename}`;
  } else if (fotoAtual) {
    foto = fotoAtual;
  } else {
    return res.status(400).json({
      success: false,
      message: "Imagem não enviada e nenhuma imagem anterior informada.",
    });
  }

  const destaqueFinal = destaque === "true" || destaque === true ? 1 : 0;

  const produtoAtualizado = { titulo, descricao, valorKg, foto, destaque: destaqueFinal, categoria, local };

  productModel.updateProduct(id, produtoAtualizado, (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar produto" });
    res.json({ success: true, message: "Produto atualizado com sucesso" });
  });
};

// Excluir produto
const remove = (req, res) => {
  const id = req.params.id;

  productModel.deleteProduct(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao excluir produto" });
    res.json({ success: true, message: "Produto excluído com sucesso" });
  });
};

// Atualizar destaque
const toggleDestaque = (req, res) => {
  const id = req.params.id;
  const { destaque } = req.body;

  if (typeof destaque !== "boolean") {
    return res.status(400).json({ success: false, message: "Valor de destaque inválido" });
  }

  productModel.updateDestaque(id, destaque ? 1 : 0, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao atualizar destaque" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Produto não encontrado" });
    }

    res.json({ success: true, message: "Destaque atualizado com sucesso" });
  });
};

module.exports = {
  getAll,
  getById,
  getDestaques,
  create,
  update,
  remove,
  toggleDestaque,
  getFrigorifico,
  getAcougue,
};
