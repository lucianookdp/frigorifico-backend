const orcamentoModel = require("../models/orcamentoModel");

// Criar novo orçamento
const criarOrcamento = async (req, res) => {
    try {
        const { nome, local, email, empresa, produtos } = req.body;

        if (!nome || !local || !email || !empresa || !Array.isArray(produtos) || produtos.length === 0) {
            return res.status(400).json({ success: false, message: "Preencha todos os dados do orçamento." });
        }

        // Verifica se todos os produtos são da mesma empresa (Frigorifico ou Acougue)
        const empresaValida = produtos.every(p => p.local === empresa);
        if (!empresaValida) {
            return res.status(400).json({ success: false, message: "Não é permitido misturar produtos de empresas diferentes." });
        }

        // Calcula valor total do orçamento
        const valor_total = produtos.reduce((soma, item) => {
            const totalProduto = Number(item.valorKg) * Number(item.quantidade);
            return soma + totalProduto;
        }, 0);

        // Busca os nomes dos produtos diretamente no banco de dados
        const idsProdutos = produtos.map(p => p.id);
        orcamentoModel.buscarProdutosPorIds(idsProdutos, (err, produtosDB) => {
            if (err) {
                console.error("Erro ao buscar nomes dos produtos:", err);
                return res.status(500).json({ success: false, message: "Erro ao buscar produtos." });
            }

            // Mapa para vincular id ao título
            const mapa = {};
            produtosDB.forEach(p => {
                mapa[p.id] = p.titulo;
            });

            // Cria o JSON detalhado com nomes reais
            const itens_detalhados = JSON.stringify(
                produtos.map((p) => ({
                    produto: mapa[p.id] || "Produto não identificado",
                    quantidade: p.quantidade,
                    valor_unitario: Number(p.valorKg).toFixed(2),
                }))
            );

            // Insere o orçamento principal
            orcamentoModel.criarOrcamento(
                { nome, local, email, empresa, valor_total, itens_detalhados },
                (err, resultado) => {
                    if (err) {
                        console.error("Erro ao salvar orçamento:", err);
                        return res.status(500).json({ success: false, message: "Erro ao salvar orçamento." });
                    }

                    const id_orcamento = resultado.insertId;

                    // Insere os itens no relacionamento
                    const itens = produtos.map((p) => [
                        id_orcamento,
                        p.id,
                        p.quantidade,
                        p.valorKg
                    ]);

                    orcamentoModel.inserirItens(itens, (erro) => {
                        if (erro) {
                            console.error("Erro ao salvar itens do orçamento:", erro);
                            return res.status(500).json({ success: false, message: "Erro ao salvar os itens do orçamento." });
                        }

                        res.status(201).json({ success: true, message: "Orçamento salvo com sucesso." });
                    });
                }
            );
        });
    } catch (error) {
        console.error("Erro no controller:", error);
        res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
};

// Listar todos os orçamentos
const listarOrcamentos = (req, res) => {
    orcamentoModel.listarTodos((err, results) => {
        if (err) {
            console.error("Erro ao listar orçamentos:", err);
            return res.status(500).json({ success: false, message: "Erro ao buscar orçamentos." });
        }
        res.json(results);
    });
};

// Deletar um orçamento
const deletarOrcamento = (req, res) => {
    const id = req.params.id;

    orcamentoModel.deletar(id, (err, result) => {
        if (err) {
            console.error("Erro ao deletar orçamento:", err);
            return res.status(500).json({ success: false, message: "Erro ao deletar orçamento." });
        }
        res.json({ success: true, message: "Orçamento deletado com sucesso." });
    });
};

module.exports = {
    criarOrcamento,
    listarOrcamentos,
    deletarOrcamento,
};
