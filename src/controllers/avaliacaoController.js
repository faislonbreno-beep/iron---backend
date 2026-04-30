const db = require('../config/database');

exports.getAvaliacoesPorProduto = async (req, res) => {
    const { produto_id } = req.params;
    try {
        // Buscar o nome do produto atual
        const [prod] = await db.query('SELECT nome FROM produtos WHERE id = ?', [produto_id]);
        if (prod.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        const nomeProduto = prod[0].nome;

        const [rows] = await db.query(`
            SELECT a.*, u.nome as usuario_nome 
            FROM avaliacoes a
            JOIN usuarios u ON a.usuario_id = u.id
            JOIN produtos p ON a.produto_id = p.id
            WHERE TRIM(LOWER(p.nome)) = TRIM(LOWER(?))
            ORDER BY a.criado_em DESC`, 
            [nomeProduto]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAvaliacao = async (req, res) => {
    const { usuario_id, produto_id, nota, comentario } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO avaliacoes (usuario_id, produto_id, nota, comentario) VALUES (?, ?, ?, ?)',
            [usuario_id, produto_id, nota, comentario]
        );
        res.status(201).json({ id: result.insertId, message: 'Avaliação enviada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
