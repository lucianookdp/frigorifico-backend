const db = require("../config/db");

const criarOrcamento = (orcamento, callback) => {
  const query = `
    INSERT INTO orcamentos (
      nome_cliente, local_cliente, email_cliente, empresa, valor_total, itens_detalhados
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    orcamento.nome,
    orcamento.local,
    orcamento.email,
    orcamento.empresa,
    orcamento.valor_total,
    orcamento.itens_detalhados,
  ];

  db.query(query, values, callback);
};

const inserirItens = (itens, callback) => {
  const query = `
    INSERT INTO orcamento_itens (id_orcamento, id_produto, quantidade, valor_unitario)
    VALUES ?
  `;
  db.query(query, [itens], callback);
};

const listarTodos = (callback) => {
  const query = `
    SELECT * FROM orcamentos ORDER BY id DESC
  `;
  db.query(query, callback);
};

const deletar = (id, callback) => {
  const queryItens = `DELETE FROM orcamento_itens WHERE id_orcamento = ?`;
  const queryOrcamento = `DELETE FROM orcamentos WHERE id = ?`;

  db.query(queryItens, [id], (err) => {
    if (err) return callback(err);
    db.query(queryOrcamento, [id], callback);
  });
};

// 🔍 NOVO: buscar produtos por array de IDs
const buscarProdutosPorIds = (ids, callback) => {
  const query = `
    SELECT id, titulo FROM produtos WHERE id IN (?)
  `;
  db.query(query, [ids], callback);
};

module.exports = {
  criarOrcamento,
  inserirItens,
  listarTodos,
  deletar,
  buscarProdutosPorIds,
};
