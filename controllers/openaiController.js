// controllers/openaiController.js
const axios = require("axios");

// ── Util: normalizar acentos para comparações robustas
function norm(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const termosSensiveis = [
  "lula","bolsonaro","presidente","eleição","politica","filosofia",
  "religiao","sexo","drogas","guerra","armas","economia","hipoteticamente",
  "chatgpt","openai","modelo","codigo","piada","hack","violencia",
  "governo","partido","corrupcao","militar","crime","terrorismo","conspiracao",
  "vacina","ideologia","opiniao","manifestacao","artificial","deus","inferno",
  "paraiso","ateismo","milagre","congresso","senado","tortura","revolucao"
];

const termosContexto = [
  "carne","frigorifico","frigorifico","acougue","orcamento","catalogo",
  "pedido","produto","endereco","atendimento","preparo","congelamento",
  "armazenamento","churrasco","evento","kg","quilo","preco","retirada",
  "entrega","whatsapp","frigorifico padilha","padilha"
];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL  = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_URL    = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";

function sanitizeHistoric(h) {
  if (!Array.isArray(h)) return [];
  // Mantém só últimos 10 e só objetos válidos { role, content }
  return h
    .slice(-10)
    .filter(m => m && typeof m === "object" && typeof m.role === "string" && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content }));
}

const chatWithGPT = async (req, res) => {
  try {
    const { pergunta, historico } = req.body;

    // ── validação básica
    if (!pergunta || typeof pergunta !== "string" || pergunta.length > 300) {
      return res.status(400).json({
        resposta: "Sua pergunta está vazia ou muito longa. Reformule de forma mais objetiva."
      });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        resposta: "Configuração ausente do servidor (chave de IA)."
      });
    }

    // ── filtro de escopo (robusto com normalização)
    const pNorm = norm(pergunta);
    const temSensivel = termosSensiveis.some(t => pNorm.includes(t));
    const temContexto = termosContexto.some(t => pNorm.includes(t));

    if (temSensivel && !temContexto) {
      return res.status(403).json({
        resposta:
          "Este assistente responde apenas dúvidas sobre carnes, preparo, conservação e serviços do Frigorífico Padilha. Reformule sua pergunta dentro desse contexto, por favor."
      });
    }

    // ── monta mensagens (system + histórico válido + usuário)
    const mensagens = [
      {
        role: "system",
        content: `
Você é o assistente virtual oficial do Frigorífico Padilha, fundado em 2000 em Guarapuava.

Seu papel é atender como um funcionário humano do frigorífico, de forma cordial, profissional, eficiente e direta, auxiliando clientes reais. Evite informalidades artificiais, negrito com asteriscos, travessões ou emojis. Utilize uma linguagem objetiva e educada.

Você está autorizado a responder perguntas relacionadas a:
- Diferenças entre carnes bovinas, suínas e de aves
- Armazenamento, preparo e dicas gerais sobre carnes
- Funcionamento do Catálogo e como fazer orçamentos no site
- Endereços físicos, formas de atendimento e informações úteis

Ao mencionar produtos, nunca liste cortes. Oriente o cliente a acessar o Catálogo do site.

Ao mencionar orçamento:
1. Diga "Claro, posso te explicar como funciona."
2. Espere um "sim" ou confirmação do cliente antes de continuar o passo a passo.

Se perguntarem por sugestões de carne para eventos, utilize esta estimativa:
- 300g por adulto
- 200g por criança
- Multiplique pelo valor médio por quilo
- Enfatize que o ideal é confirmar com um profissional

Endereços:
Frigorífico Padilha – Rua Miguel Padilha - Boqueirão, Guarapuava - PR, 85100-000
Açougue Padilha – Av. Ver. Serafim Ribas, 3350 - Boqueirão, Guarapuava - PR, 85023-500

Horários de funcionamento (somente se a pessoa pedir):
Frigorífico:
Seg a Sex: 07:15–12:00, 13:00–17:30 | Sáb: 07:30–12:00 | Dom: Fechado
Açougue:
Seg a Sex: 08:00–12:00, 13:30–18:30 | Sáb: 08:00–12:00, 14:00–19:00 | Dom: Fechado

Nunca responda perguntas políticas, ideológicas, religiosas ou fora do escopo do frigorífico.
Conduza como se fosse um funcionário do atendimento real.
        `.trim()
      },
      ...sanitizeHistoric(historico),
      { role: "user", content: pergunta } // ← OBRIGATÓRIO segundo a doc
    ];

    // ── chamada à OpenAI (Chat Completions)
    const respostaAPI = await axios.post(
      OPENAI_URL,
      {
        model: OPENAI_MODEL,
        messages: mensagens
        // sem temperature (evita 400 em modelos que fixam o valor)
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30_000 // 30s
      }
    );

    const mensagem = respostaAPI?.data?.choices?.[0]?.message?.content;
    if (!mensagem || typeof mensagem !== "string") {
      // retorna texto bruto para depuração rápida
      return res.status(502).json({
        resposta: "Não foi possível interpretar a resposta da IA.",
        detalhe: respostaAPI?.data
      });
    }

    return res.json({ resposta: mensagem });
  } catch (erro) {
    // logs detalhados no servidor
    console.error("Erro ao comunicar com a API do ChatGPT:");
    if (erro.response) {
      console.error("Status:", erro.response.status);
      console.error("Dados:", erro.response.data);
      // repassa mensagem útil quando for erro de requisição inválida (4xx)
      const status = erro.response.status || 500;
      const detail = erro.response.data?.error?.message || "Falha ao processar a solicitação na IA.";
      return res.status(status).json({ resposta: detail });
    } else {
      console.error("Erro direto:", erro.message);
      return res.status(500).json({
        resposta: "Erro ao se comunicar com a IA. Tente novamente mais tarde."
      });
    }
  }
};

module.exports = { chatWithGPT };
