const db = require('../config/database');

// Buscar o carrinho do usuário (ou criar se não existir)
exports.getCarrinho = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        // 1. Verificar se existe carrinho ativo
        let [carrinhos] = await db.query('SELECT id FROM carrinhos WHERE usuario_id = ?', [usuario_id]);
        
        let carrinhoId;
        if (carrinhos.length === 0) {
            const [result] = await db.query('INSERT INTO carrinhos (usuario_id) VALUES (?)', [usuario_id]);
            carrinhoId = result.insertId;
        } else {
            carrinhoId = carrinhos[0].id;
        }

        // 2. Buscar itens do carrinho
        const [itens] = await db.query(`
            SELECT ci.*, p.nome, p.preco, p.imagem_url 
            FROM carrinhos_itens ci
            JOIN produtos p ON ci.produto_id = p.id
            WHERE ci.carrinho_id = ?`, 
            [carrinhoId]
        );

        res.json({ id: carrinhoId, itens });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Adicionar ou atualizar item no carrinho
exports.updateItemCarrinho = async (req, res) => {
    const { usuario_id, produto_id, quantidade } = req.body;
    try {
        // Garantir que o carrinho existe
        let [carrinhos] = await db.query('SELECT id FROM carrinhos WHERE usuario_id = ?', [usuario_id]);
        let carrinhoId;
        if (carrinhos.length === 0) {
            const [result] = await db.query('INSERT INTO carrinhos (usuario_id) VALUES (?)', [usuario_id]);
            carrinhoId = result.insertId;
        } else {
            carrinhoId = carrinhos[0].id;
        }

        if (quantidade <= 0) {
            await db.query('DELETE FROM carrinhos_itens WHERE carrinho_id = ? AND produto_id = ?', [carrinhoId, produto_id]);
            return res.json({ message: 'Item removido' });
        }

        // Upsert (Insert on duplicate key update)
        await db.query(`
            INSERT INTO carrinhos_itens (carrinho_id, produto_id, quantidade) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantidade = ?`, 
            [carrinhoId, produto_id, quantidade, quantidade]
        );

        res.json({ message: 'Carrinho atualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Limpar carrinho (após pedido finalizado)
exports.clearCarrinho = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [carrinhos] = await db.query('SELECT id FROM carrinhos WHERE usuario_id = ?', [usuario_id]);
        if (carrinhos.length > 0) {
            await db.query('DELETE FROM carrinhos_itens WHERE carrinho_id = ?', [carrinhos[0].id]);
        }
        res.json({ message: 'Carrinho limpo' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
